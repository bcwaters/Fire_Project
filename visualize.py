import json
import matplotlib.pyplot as plt
import numpy as np

def get_data(file_path):
    with open(file_path, 'r') as file:
        data = json.load(file)
    return data

# D3 color scheme constants to match web components
D3_COLORS = {
    'charcoal': '#36454F',      # Total acres, personnel, crews
    'pastel_green': '#4e8a4e',  # Containment, positive changes
    'dark_red': '#8b2513',      # Negative changes
    'dark_grey': '#696969',     # Crews
    'medium_grey': '#A9A9A9',   # Engines
    'light_grey': '#D3D3D3'     # Helicopters
}

def visualize_summary_data(data, target_dir, header_data):
    # Extract numerical data for plotting
    incident_names = []
    total_acres = []
    area_contained = []
    personnel = []
    change_personnel = []
    crews = []
    engines = []
    helicopters = []
    
    for incident in data:
        incident_names.append(incident['GACC'])
        # Convert Cumulative Acres to numeric (remove commas)
        acres_str = incident['Cumulative Acres'].replace(',', '')
        try:
            total_acres.append(float(acres_str))
        except ValueError:
            total_acres.append(0)
        # Incidents
        try:
            area_contained.append(int(incident['Incidents']))
        except ValueError:
            area_contained.append(0)
        # Total Personnel
        ppl_str = incident['Total Personnel'].replace(',', '')
        try:
            personnel.append(int(ppl_str))
        except ValueError:
            personnel.append(0)
        # Change in Personnel
        try:
            change_personnel.append(int(incident['Change in Personnel']))
        except ValueError:
            change_personnel.append(0)
        # Crews
        try:
            crews.append(int(incident['Crews']))
        except ValueError:
            crews.append(0)
        # Engines
        try:
            engines.append(int(incident['Engines']))
        except ValueError:
            engines.append(0)
        # Helicopters
        try:
            helicopters.append(int(incident['Helicopters']))
        except ValueError:
            helicopters.append(0)

    # Create subplots - 4 plots with the 4th for text details (scaled down by ~75%)
    fig, ((ax1, ax2), (ax3, ax4)) = plt.subplots(2, 2, figsize=(11, 7.5))  # Reduced from (15, 10)
    fig.suptitle(f'National Fire Summary Analysis\n{header_data["header"][1]}', fontsize=12)  # Reduced from 16
    
    # Set background color to match web interface
    fig.patch.set_facecolor('#f5f5f5')
    ax1.set_facecolor('#f5f5f5')
    ax2.set_facecolor('#f5f5f5')
    ax3.set_facecolor('#f5f5f5')
    ax4.set_facecolor('#f5f5f5')

    x = np.arange(len(incident_names))
    width = 0.35

    # Plot 1: Cumulative Acres and Incidents by GACC
    ax1.bar(x - width/2, total_acres, width, label='Cumulative Acres', color=D3_COLORS['charcoal'], alpha=0.7)
    ax1.bar(x + width/2, area_contained, width, label='Incidents', color=D3_COLORS['pastel_green'], alpha=0.7)
    ax1.set_title('Cumulative Acres and Incidents by GACC', fontsize=10)  # Reduced from default
    ax1.set_xlabel('GACC', fontsize=9)  # Reduced from default
    ax1.set_ylabel('Acres / Incidents', fontsize=9)  # Reduced from default
    ax1.set_xticks(x)
    labels1 = [f"{name}: {acres:,.0f} ({inc} fires)" for name, acres, inc in zip(incident_names, total_acres, area_contained)]
    ax1.set_xticklabels(labels1, rotation=45, ha='right', fontsize=8)  # Reduced from default
    ax1.legend(fontsize=8)  # Reduced from default
    ax1.tick_params(axis='both', which='major', labelsize=8)  # Reduced tick label size

    # Plot 2: Personnel by GACC (Total and Change)
    ax2.bar(x - width/2, personnel, width, label='Total Personnel', color=D3_COLORS['charcoal'], alpha=0.7)
    change_colors = [D3_COLORS['dark_red'] if val < 0 else D3_COLORS['pastel_green'] for val in change_personnel]
    ax2.bar(x + width/2, change_personnel, width, label='Change in Personnel', color=change_colors, alpha=0.7)
    ax2.set_title('Personnel by GACC', fontsize=10)  # Reduced from default
    ax2.set_xlabel('GACC', fontsize=9)  # Reduced from default
    ax2.set_ylabel('Personnel', fontsize=9)  # Reduced from default
    ax2.set_xticks(x)
    labels2 = [f"{name}: {p} ({c:+d})" if c != 0 else f"{name}: {p}" for name, p, c in zip(incident_names, personnel, change_personnel)]
    ax2.set_xticklabels(labels2, rotation=45, ha='right', fontsize=8)  # Reduced from default
    ax2.legend(fontsize=8)  # Reduced from default
    ax2.tick_params(axis='both', which='major', labelsize=8)  # Reduced tick label size

    # Plot 3: Resources Comparison
    width3 = 0.25
    ax3.bar(x - width3, crews, width3, label='Crews', color=D3_COLORS['dark_grey'], alpha=0.7)
    ax3.bar(x, engines, width3, label='Engines', color=D3_COLORS['medium_grey'], alpha=0.7)
    ax3.bar(x + width3, helicopters, width3, label='Helicopters', color=D3_COLORS['light_grey'], alpha=0.7)
    ax3.set_title('Resources by GACC', fontsize=10)  # Reduced from default
    ax3.set_xlabel('GACC', fontsize=9)  # Reduced from default
    ax3.set_ylabel('Count', fontsize=9)  # Reduced from default
    ax3.set_xticks(x)
    ax3.set_xticklabels(incident_names, rotation=45, ha='right', fontsize=8)  # Reduced from default
    ax3.legend(fontsize=8)  # Reduced from default
    ax3.tick_params(axis='both', which='major', labelsize=8)  # Reduced tick label size

    # Plot 4: Text Details
    ax4.axis('off')
    text_content = "Details:\n\n"
    text_content += "GACC      Inc  Acres    Crw  Eng  Hel  PPL  Chg\n"
    text_content += "-" * 50 + "\n"
    for i, name in enumerate(incident_names):
        short_name = name[:8] if len(name) > 8 else name
        text_content += f"{short_name:<8} {area_contained[i]:>3} {total_acres[i]:>8,.0f} {crews[i]:>4} {engines[i]:>4} {helicopters[i]:>4} {personnel[i]:>4} {change_personnel[i]:>4}\n"
    ax4.text(0.05, 0.95, text_content, transform=ax4.transAxes, fontsize=8,  # Reduced from 10
             verticalalignment='top', fontfamily='monospace', bbox=dict(boxstyle="round,pad=0.3", facecolor="lightgray", alpha=0.8))

    plt.tight_layout()
    plt.savefig(f'{target_dir}/fire_summary_analysis.png', dpi=75, bbox_inches='tight')  # Reduced from 150
    #plt.show()

def visualize_region_data(idx, region, data, target_dir, header_data):
    # Extract numerical data for plotting
    incident_names = []
    total_acres = []
    area_contained = []
    personnel = []
    change_personnel = []
    crews = []
    engines = []
    helicopters = []
    
    for incident in data:
        incident_names.append(incident['Incident Name'])
        
        # Convert Total Acres to numeric (remove commas)
        acres_str = incident['Total Acres'].replace(',', '')
        try:
            total_acres.append(float(acres_str))
        except ValueError:
            total_acres.append(0)
        
        # Convert % Ctn/Comp to numeric
        try:
            area_contained.append(int(incident['%']))
        except ValueError:
            area_contained.append(0)
        
        # Convert Total PPL to numeric (handle "UNK" and "X/Y" format)
        ppl_str = incident['Total PPL']
        if ppl_str == 'UNK':
            personnel.append(0)
        else:
            # Extract first number from "X/Y" format and remove commas
            try:
                cleaned_ppl = ppl_str.split('/')[0].replace(',', '')
                ppl_num = int(cleaned_ppl)
                personnel.append(ppl_num)
            except (ValueError, IndexError):
                personnel.append(0)
        
        # Convert Change in PPL to numeric (remove commas)
        change_ppl_str = incident['Chge in PPL']
        try:
            change_personnel.append(int(change_ppl_str.replace(',', '')))
        except ValueError:
            change_personnel.append(0)
        
        # Convert other numeric fields
        try:
            crews.append(int(incident['Crw']))
        except ValueError:
            crews.append(0)
        
        try:
            engines.append(int(incident['Eng']))
        except ValueError:
            engines.append(0)
        
        try:
            helicopters.append(int(incident['Heli']))
        except ValueError:
            helicopters.append(0)
    
    # Create subplots - 4 plots with the 4th for text details (scaled down by ~75%)
    fig, ((ax1, ax2), (ax3, ax4)) = plt.subplots(2, 2, figsize=(11, 7.5))  # Reduced from (15, 10)
    fig.suptitle(f'Fire Incident Analysis\nRegion {region}\n{header_data["header"][1]}', fontsize=12)  # Reduced from 16
    
    # Set background color to match web interface
    fig.patch.set_facecolor('#f5f5f5')
    ax1.set_facecolor('#f5f5f5')
    ax2.set_facecolor('#f5f5f5')
    ax3.set_facecolor('#f5f5f5')
    ax4.set_facecolor('#f5f5f5')
    
    #Plot 1: Total Acres and Containment by Incident
    x = np.arange(len(incident_names))
    width = 0.35
    
    # Total acres bar
    ax1.bar(x - width/2, total_acres, width, label='Total Acres', color=D3_COLORS['charcoal'], alpha=0.7)
    
    # Containment percentage bar (scaled by corresponding acreage)
    scaled_containment = [(contained / 100) * acres for contained, acres in zip(area_contained, total_acres)]
    ax1.bar(x + width/2, scaled_containment, width, label='Containment % (scaled)', color=D3_COLORS['pastel_green'], alpha=0.7)
    
    ax1.set_title('Total Acres and Containment by Incident', fontsize=10)  # Reduced from default
    ax1.set_xlabel('Incident', fontsize=9)  # Reduced from default
    ax1.set_ylabel('Acres / Scaled Percentage', fontsize=9)  # Reduced from default
    ax1.set_xticks(x)
    # Include acres and area contained in x-axis labels
    labels1 = [f"{name}: {acres:,.0f} ({contained}%)" for name, acres, contained in zip(incident_names, total_acres, area_contained)]
    ax1.set_xticklabels(labels1, rotation=45, ha='right', fontsize=8)  # Reduced from default
    ax1.legend(fontsize=8)  # Reduced from default
    ax1.tick_params(axis='both', which='major', labelsize=8)  # Reduced tick label size
    #avg_acres = sum(total_acres) / len(total_acres) if total_acres else 0
   # ax1.set_ylim(0, avg_acres)  # Use average with 50% padding
    
    # Plot 2: Personnel by Incident (Total and Change)
    x = np.arange(len(incident_names))
    width = 0.35
    
    ax2.bar(x - width/2, personnel, width, label='Total Personnel', color=D3_COLORS['charcoal'], alpha=0.7)
    
    # Color change in personnel bars based on positive/negative values
    change_colors = [D3_COLORS['dark_red'] if val < 0 else D3_COLORS['pastel_green'] for val in change_personnel]
    ax2.bar(x + width/2, change_personnel, width, label='Change in Personnel', color=change_colors, alpha=0.7)
    
    ax2.set_title('Personnel by Incident', fontsize=10)  # Reduced from default
    ax2.set_xlabel('Incident', fontsize=9)  # Reduced from default
    ax2.set_ylabel('Personnel', fontsize=9)  # Reduced from default
    ax2.set_xticks(x)
    # Include total personnel and change in x-axis labels (only show change if non-zero)
    labels2 = [f"{name}: {p} ({c:+d})" if c != 0 else f"{name}: {p}" for name, p, c in zip(incident_names, personnel, change_personnel)]
    ax2.set_xticklabels(labels2, rotation=45, ha='right', fontsize=8)  # Reduced from default
    ax2.legend(fontsize=8)  # Reduced from default
    ax2.tick_params(axis='both', which='major', labelsize=8)  # Reduced tick label size
    #avg_personnel = sum(personnel + change_personnel) / len(personnel + change_personnel) if (personnel + change_personnel) else 0
    #ax2.set_ylim(0, avg_personnel * 1.5)  # Use average with 50% padding
    
    # Plot 3: Resources Comparison
    x = np.arange(len(incident_names))
    width = 0.25
    
    ax3.bar(x - width, crews, width, label='Crews', color=D3_COLORS['dark_grey'], alpha=0.7)
    ax3.bar(x, engines, width, label='Engines', color=D3_COLORS['medium_grey'], alpha=0.7)
    ax3.bar(x + width, helicopters, width, label='Helicopters', color=D3_COLORS['light_grey'], alpha=0.7)
    
    ax3.set_title('Resources by Incident', fontsize=10)  # Reduced from default
    ax3.set_xlabel('Incident', fontsize=9)  # Reduced from default
    ax3.set_ylabel('Count', fontsize=9)  # Reduced from default
    ax3.set_xticks(x)
    # Simplify x-axis labels to just incident names
    ax3.set_xticklabels(incident_names, rotation=45, ha='right', fontsize=8)  # Reduced from default
    ax3.legend(fontsize=8)  # Reduced from default
    ax3.tick_params(axis='both', which='major', labelsize=8)  # Reduced tick label size
    
    # Plot 4: Text Details
    ax4.axis('off')  # Turn off axes for text display
    
    # Create text content for details
    text_content = "Details:\n\n"
    text_content += "Incident      Crw  Eng  Hel  Cont  PPL  Cost\n"
    text_content += "-" * 50 + "\n"
    for i, name in enumerate(incident_names):
        # Truncate long incident names to fit in table format
        short_name = name[:12] if len(name) > 12 else name
        
        # Get additional data
        contained_pct = area_contained[i]
        total_ppl = personnel[i]
        
        # Get CTD value and replace $ with empty string
        ctd_value = str(data[i].get('$$ CTD', '0')).replace('$', '')
        
        text_content += f"{short_name:<12} {crews[i]:>4} {engines[i]:>4} {helicopters[i]:>4} {contained_pct:>4}% {total_ppl:>4} {ctd_value:>8}\n"
    
    # Display the text in the 4th subplot
    ax4.text(0.05, 0.95, text_content, transform=ax4.transAxes, fontsize=8,  # Reduced from 10
             verticalalignment='top', fontfamily='monospace', bbox=dict(boxstyle="round,pad=0.3", facecolor="lightgray", alpha=0.8))
    
    plt.tight_layout()  # Add back tight layout
    
    # Save the plot to a file
    plt.savefig(f'{target_dir}/fire_analysis_region_{idx}.png', dpi=75, bbox_inches='tight')  # Reduced from 150
    
    #plt.show()


