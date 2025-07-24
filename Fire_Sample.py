import json
import re
import sys
import os
import random
import string
import requests
from datetime import datetime

# Optional: Only import PyPDF2 if needed
try:
    import PyPDF2
except ImportError:
    PyPDF2 = None

data_dir = 'data'
today = datetime.now().strftime('%Y%m%d')

default_url = "https://www.nifc.gov/nicc-files/sitreprt.pdf"

def download_pdf(url, save_dir):
    os.makedirs(save_dir, exist_ok=True)
    today = datetime.now().strftime('%Y%m%d')
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
        print('Region header not found.')
        return []
    # Find the first non-empty line after the header (should be the column header)
    for j in range(start_idx+1, len(lines)):
        if lines[j].strip():
            header_idx = j
            break
    else:
        print('No table header found after region header.')
        return []
    # Find the first occurrence of 'Incident Name' after the region header
    header_start = None
    for j in range(start_idx+1, len(lines)):
        if 'Incident Name' in lines[j]:
            header_start = j
            break
    if header_start is None:
        print("'Incident Name' header not found after region header.")
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
        print("'Own' header line not found after 'Incident Name'.")
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
        # Stop if we hit another region, a summary line, or 'Great Basin Area (PL 4)'
        if re.match(r'^[A-Z][a-z]+ Area', line) or line.startswith('Total') or line == 'Great Basin Area (PL 4)':
            break
        # Replace all occurrences of '---' with 'NAN'
        #line = line.replace('---', 'NAN')
        # Split the line by whitespace
        tokens = line.split()
        # Find the index of the first numeric token
        num_idx = None
        for idx, tok in enumerate(tokens):
            # Remove commas for numeric check
            tok_clean = tok.replace(',', '')
            if tok_clean.replace('.', '', 1).isdigit():
                num_idx = idx
                break
        # Validation: count numeric words in the line
        numeric_count = sum(
            1 for tok in tokens if tok.replace(',', '').replace('.', '', 1).isdigit()
        )
        if numeric_count < 4:
            k += 1
            continue  # Skip lines with fewer than 4 numeric words
        if num_idx is not None and num_idx > 0:
            unit = tokens[num_idx - 1]
            incident_name = ' '.join(tokens[:num_idx - 1])
            rest = tokens[num_idx:]
        else:
            # Fallback: treat first token as incident name
            incident_name = tokens[0] if tokens else ''
            unit = tokens[1] if len(tokens) > 1 else ''
            rest = tokens[2:] if len(tokens) > 2 else []
        entry = {columns[0]: incident_name, columns[1]: unit}
        for col, val in zip(columns[2:], rest):
            entry[col] = val
        # Pad missing columns
        for col in columns[2+len(rest):]:
            entry[col] = ''
        data_rows.append(entry)
        k += 1
    print('--- Parsed Region Table ---')
    print(json.dumps(data_rows, indent=2))
    print('--------------------------')
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

    print('--- Lines after Total logic ---')
    for l in summary_lines:
        print(l)
    print('-------------------------------')

    # Remove header lines and split into lines
    lines = [line.strip() for line in summary_lines if line.strip()]
    # Only include lines that start with a region code (3-4 uppercase letters) or 'Total', but skip the header line 'GACC ...'
    data_lines = [
        line for line in lines
        if (re.match(r'^(?:[A-Z]{3,4}|Total)\b', line) and not line.startswith('GACC'))
    ]

    print('--- Filtered Data Lines ---')
    for l in data_lines:
        print(l)
    print('---------------------------')

    # Define the columns
    columns = [
        "GACC", "Incidents", "Cumulative Acres", "Crews", "Engines",
        "Helicopters", "Total Personnel", "Change in Personnel"
    ]

    # Parse each data line
    result = []
    for line in data_lines:
        # Split by whitespace, but keep numbers with commas together
        parts = re.findall(r'(?:[A-Z]{3,4}|Total)|\d{1,3}(?:,\d{3})*|-?\d+', line)
        # Pad with zeros if missing columns
        while len(parts) < len(columns):
            parts.append("0")
        entry = dict(zip(columns, parts))
        result.append(entry)

    print('--- Parsed Result ---')
    print(json.dumps(result, indent=2))
    print('---------------------')

    # Save as JSON file
    out_filename = os.path.join(data_dir, f'fire_summary_{today}.json')
    with open(out_filename, 'w') as f:
        json.dump(result, f, indent=2)

    print(f"Saved {out_filename}")


def detect_region(lines):
    """
    Finds all lines that contain 'Fire Activity and Teams Assigned   Totals    '
    and outputs the line before each occurrence.
    """
    target = 'Fire Activity and Teams Assigned   Totals'
    found = []
    for i, line in enumerate(lines):
        if target in line and i > 0:
            print(f'Region detected before line {i}: {lines[i-1]}')
            found.append(lines[i-1])
    return found

def main():
    if len(sys.argv) == 2:
        file_path = sys.argv[1]
    else:
        print(f"No input file provided. Using default URL: {default_url}")
        file_path = default_url
    today = datetime.now().strftime('%Y%m%d')
    data_dir = os.path.join('data', today)
    os.makedirs(data_dir, exist_ok=True)
    if is_url(file_path):
        try:
            file_path = download_pdf(file_path, save_dir=data_dir)
            ext = '.pdf'
        except Exception as e:
            print(f"Failed to download PDF: {e}")
            sys.exit(1)
    else:
        if not os.path.exists(file_path):
            print(f"File not found: {file_path}")
            sys.exit(1)
        ext = os.path.splitext(file_path)[1].lower()
    if ext == '.pdf':
        print(f"Extracting text from PDF: {file_path}")
        file_text = extract_text_from_pdf(file_path)
    else:
        print(f"Loading text file: {file_path}")
        file_text = load_text_file(file_path)

    parse_summary_table(file_text, data_dir, today)

    print('--- Parsing Region Table ---')
   
    print('--- Parsed Region Table ---')

    print('--- Detecting Regions ---')
    regions = detect_region(file_text.splitlines())
    print('--- Detected Regions ---')
    regions_dir = os.path.join(data_dir, 'regions')
    os.makedirs(regions_dir, exist_ok=True)
    region_key = {}
    for idx, r in enumerate(regions, 1):
         print(f'--- Parsing Region Table: {r} ---')
         region_data = parse_region_table(file_text.splitlines(), r)
         # Save each region's data as a JSON file in data/TODAY/regions
         out_filename = os.path.join(regions_dir, f'Region_{idx}_{today}.json')
         with open(out_filename, 'w') as f:
             json.dump(region_data, f, indent=2)
         print(f'Saved {out_filename}')
         region_key[str(idx)] = r
    # Save the region key as a JSON file
    key_filename = os.path.join(regions_dir, f'region_key_{today}.json')
    with open(key_filename, 'w') as f:
        json.dump(region_key, f, indent=2)
    print(f'Saved region key: {key_filename}')
    print('--------------------------')


if __name__ == "__main__":
    main() 