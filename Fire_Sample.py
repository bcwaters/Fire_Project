import json
import re
import sys
import os
import random
import string
import requests
from datetime import datetime
# from visualize import visualize_region_data, visualize_summary_data
import shutil

# Optional: Only import PyPDF2 if needed
try:
    import PyPDF2
except ImportError:
    PyPDF2 = None

data_dir = 'data'
today = datetime.utcnow().strftime('%Y%m%d')

default_url = "https://www.nifc.gov/nicc-files/sitreprt.pdf"

def download_pdf(url, save_dir):
    os.makedirs(save_dir, exist_ok=True)
    today = datetime.utcnow().strftime('%Y%m%d')
    filename = f'fire_summary_{today}.pdf'
    filepath = os.path.join(save_dir, filename)
    response = requests.get(url)
    response.raise_for_status()
    with open(filepath, 'wb') as f:
        f.write(response.content)
    return filepath

def is_url(path):
    return path.startswith('http://') or path.startswith('https://')

def extract_text_from_pdf(pdf_path):
    if PyPDF2 is None:
        raise ImportError("PyPDF2 is required to extract text from PDF files.")
    text = ""
    with open(pdf_path, 'rb') as file:
        pdf_reader = PyPDF2.PdfReader(file)
        for page in pdf_reader.pages:
            page_text = page.extract_text()
            if page_text:
                text += page_text + "\n"
    return text

def load_text_file(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        return f.read()

def random_tag(length=3):
    return ''.join(random.choices(string.ascii_uppercase + string.digits, k=length))

#Predictive Services Discussion:
def parse_pred_services(lines, data_dir):
    """
    Joins all lines after the line containing 'Predictive Services' into a single string,
    saves it to predictive_summary.txt in the data_dir, and returns the string.
    """
    for idx, line in enumerate(lines):
        if 'Predictive Services' in line:
            summary_lines = lines[idx+1:]
            #replace each line with is an empty string with a new line
            for i, line in enumerate(summary_lines):
                if line.strip()  == '':
                    summary_lines[i] = '\n\n'

            summary_str = ''.join(summary_lines).strip()
            out_path = os.path.join(data_dir, 'predictive_summary.txt')
            with open(out_path, 'w', encoding='utf-8') as f:
                f.write(summary_str)
            return summary_str
    return ''


def parse_region_table(lines, region_name):
    """
    Parses the first table after the line 'Northwest Area (PL 3)' in the provided lines.
    Uses the columns provided in the user selection.
    """

    # Find the start of the region
    start_idx = None
    for i, line in enumerate(lines):
        if region_name in line:
            start_idx = i
            break
    if start_idx is None:
        return []
    # Find the first non-empty line after the header (should be the column header)
    for j in range(start_idx+1, len(lines)):
        if lines[j].strip():
            header_idx = j
            break
    else:
        return []
    # Find the first occurrence of 'Incident Name' after the region header
    header_start = None
    for j in range(start_idx+1, len(lines)):
        if 'Incident Name' in lines[j]:
            header_start = j
            break
    if header_start is None:
        return []
    # Collect header lines from 'Incident Name' up to and including the first line containing 'Own'
    header_lines = []
    own_line_idx = None
    for k in range(header_start, len(lines)):
        line = lines[k].strip()
        header_lines.append(line)
        if 'Own' in line:
            own_line_idx = k
            break
    if own_line_idx is None:
        return []
    # Data starts after the 'Own' line
    data_start = own_line_idx + 1
    # Flatten header lines and split into columns
    header_str = ' '.join(header_lines)
    header_str = re.sub(r'\s+', ' ', header_str)
    columns = [
        'Incident Name', 'Unit', 'Total Acres', 'Chge in Acres', '%' ,  'Ctn/Comp',
        'Est', 'Total PPL', 'Chge in PPL', 'Crw', 'Eng', 'Heli', 'Strc Lost', '$$ CTD', 'Origin Own'
    ]
    data_rows = []
    k = data_start
    while k < len(lines):
        line = lines[k].strip()
        # Halt parsing if a blank line is encountered
        if not line:
            break
        # If the first text is 'Incident', we've encountered a new header delimiter
        if line.startswith('Incident'):
            # Skip lines until the next 'Own' line is found
            while k < len(lines) and 'Own' not in lines[k]:
                k += 1
            k += 1  # Move to the line after 'Own'
            continue
        # Stop if we hit another region or a summary line
        if re.match(r'^[A-Z][a-z]+ Area', line) or line.startswith('Total'):
            break
        #if the line contains one token add it to the next line
        if len(line.split()) == 1:
            k += 1
            continue

        tokens = line.split()
        if len(tokens) < len(columns):
            k += 1
            continue
        # Traverse from the end, assign last N tokens to columns, rest to Incident Name
        entry = {}
        for i, col in enumerate(reversed(columns[1:])):
            entry[columns[-(i+1)]] = tokens[-(i+1)]
        incident_name_tokens = tokens[:len(tokens)-(len(columns)-1)]
        entry[columns[0]] = ' '.join(incident_name_tokens)
        data_rows.append(entry)
        k += 1
    return data_rows


def parse_summary_table(file_text, data_dir, today):
        # Extract all lines after 'Active Incident Resource Summary' up to and including the first 'Total' line
    lines = file_text.splitlines()
    collecting = False
    summary_lines = []
    for line in lines:
        if not collecting:
            if 'Active Incident Resource Summary' in line:
                collecting = True
            continue
        # Start collecting after the header
        summary_lines.append(line)
        if line.strip().startswith('Total'):
            break

    # Remove header lines and split into lines
    lines = [line.strip() for line in summary_lines if line.strip()]
    # Only include lines that start with a region code (3-4 uppercase letters) or 'Total', but skip the header line 'GACC ...'
    data_lines = [
        line for line in lines
        if (re.match(r'^(?:[A-Z]{3,4}|Total)\b', line) and not line.startswith('GACC'))
    ]

    # Define the columns
    columns = [
        "GACC", "Incidents", "Cumulative Acres", "Crews", "Engines",
        "Helicopters", "Total Personnel", "Change in Personnel"
    ]

    # Parse each data line
    result = []
    for line in data_lines:
        tokens = line.split()
        # Extract the last 7 columns in reverse order
        if len(tokens) < 8:
            # Not enough tokens, skip this line
            continue
        change_in_personnel = tokens[-1]
        total_personnel = tokens[-2]
        helicopters = tokens[-3]
        engines = tokens[-4]
        crews = tokens[-5]
        cumulative_acres = tokens[-6]
        incidents = tokens[-7]
        gacc = ' '.join(tokens[:-7])
        entry = {
            "GACC": gacc,
            "Incidents": incidents,
            "Cumulative Acres": cumulative_acres,
            "Crews": crews,
            "Engines": engines,
            "Helicopters": helicopters,
            "Total Personnel": total_personnel,
            "Change in Personnel": change_in_personnel
        }
        result.append(entry)

    # Save as JSON file
    out_filename = os.path.join(data_dir, f'fire_summary_{today}.json')
    with open(out_filename, 'w') as f:
        json.dump(result, f, indent=2)

    return result

def parse_region_summary(lines, data_dir, today):
    """
    For each region header, captures the lines between the header and the first line containing 'Incident' after it.
    Returns a dict: {region_header: [lines_between_header_and_incident]}
    """
    import re
    region_header_pattern = re.compile(r".*Area.*\(PL\s*\d+\s*\)")
    region_map = {}
    i = 0
    # print('\n'.join(lines))
    while i < len(lines):
        line = lines[i]
        header_match = region_header_pattern.search(line)
        if header_match:
            # print(line)
            region_header = line.strip()
            data_lines = []
            i += 1
            # Collect lines until we hit a line containing 'Incident' (case-insensitive)
            while i < len(lines) and 'Incident Name' not in lines[i]:
                data_lines.append(lines[i])
                i += 1
            region_map[region_header] = data_lines
        else:
            i += 1
    # Optionally, save to file
    regions_dir = os.path.join(data_dir, 'regions')
    os.makedirs(regions_dir, exist_ok=True)  # Ensure the directory exists
    out_path = os.path.join(regions_dir, f"region_summaries_{today}.json")
    with open(out_path, "w", encoding="utf-8") as f:
        import json
        json.dump(region_map, f, indent=2)
    return region_map


def detect_region(lines):
    """
    Finds all lines that contain 'Fire Activity and Teams Assigned   Totals    '
    and outputs the line before each occurrence.
    """
    target = 'Fire Activity and Teams Assigned   Totals'
    found = []
    for i, line in enumerate(lines):
        if target in line and i > 0:
            found.append(lines[i-1])
    return found

def extract_header_and_summary(file_text, data_dir, today):
    """
    Extracts the header (first three lines), the summary (lines after header up to 'Active Incident Resource Summary'),
    and stores them along with the current date in a JSON file named daily_summary.json in data_dir.
    """
    lines = file_text.splitlines()
    header = lines[:3]
    # Find the index of the 'Active Incident Resource Summary' line
    summary_end_idx = None
    for idx, line in enumerate(lines[3:], start=3):
        if 'Active Incident Resource Summary' in line:
            summary_end_idx = idx
            break
    if summary_end_idx is not None:
        summary_lines = lines[3:summary_end_idx]
    else:
        summary_lines = lines[3:]
    summary = '\n'.join(summary_lines).strip()
    header_dict = {
        'header': header,
        'summary': summary,
        'date': today
    }
    out_path = os.path.join(data_dir, 'daily_summary.json')
    with open(out_path, 'w', encoding='utf-8') as f:
        json.dump(header_dict, f, indent=2)
    return header_dict

def main():
    if len(sys.argv) == 2:
        file_path = sys.argv[1]
    else:
        file_path = default_url
    today = datetime.utcnow().strftime('%Y%m%d')
    data_dir = os.path.join('data', today)
    if os.path.exists(data_dir):
        shutil.rmtree(data_dir)
    os.makedirs(data_dir, exist_ok=True)
    if is_url(file_path):
        try:
            file_path = download_pdf(file_path, save_dir=data_dir)
            ext = '.pdf'
        except Exception as e:
            sys.exit(1)
    else:
        if not os.path.exists(file_path):
            sys.exit(1)
        ext = os.path.splitext(file_path)[1].lower()
    if ext == '.pdf':
        file_text = extract_text_from_pdf(file_path)
    else:
        file_text = load_text_file(file_path)

    # Extract and save header and summary
    header_data = extract_header_and_summary(file_text, data_dir, today)

    pred_services_text = parse_pred_services(file_text.splitlines(), data_dir)

    summary_data = parse_summary_table(file_text, data_dir, today)
    # visualize_summary_data(summary_data, f'data/{today}', header_data)

    regions = detect_region(file_text.splitlines())
    regions_dir = os.path.join(data_dir, 'regions')
    os.makedirs(regions_dir, exist_ok=True)
    region_key = {}
    for idx, r in enumerate(regions, 1):
         region_data = parse_region_table(file_text.splitlines(), r)
        
         # Save each region's data as a JSON file in data/TODAY/regions
         # visualize_region_data(idx, r, region_data, regions_dir, header_data)
         out_filename = os.path.join(regions_dir, f'Region_{idx}_{today}.json')
         with open(out_filename, 'w') as f:
             json.dump(region_data, f, indent=2)
         region_key[str(idx)] = r
    # Save the region key as a JSON file
    key_filename = os.path.join(regions_dir, f'region_key_{today}.json')
    with open(key_filename, 'w') as f:
        json.dump(region_key, f, indent=2)

    region_map = parse_region_summary(file_text.splitlines(), data_dir, today)

if __name__ == "__main__":
    main() 