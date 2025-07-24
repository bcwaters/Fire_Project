import json
import matplotlib.pyplot as plt
import numpy as np

def get_data(file_path):
    with open(file_path, 'r') as file:
        data = json.load(file)
    return data

def visualize_data(data):
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
            # Extract first number from "X/Y" format
            try:
                ppl_num = int(ppl_str.split('/')[0])
                personnel.append(ppl_num)
            except (ValueError, IndexError):
                personnel.append(0)
        
        # Convert Change in PPL to numeric
        try:
            change_personnel.append(int(incident['Chge in PPL']))
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
    
    # Create subplots - 4 plots with the 4th for text details
    fig, ((ax1, ax2), (ax3, ax4)) = plt.subplots(2, 2, figsize=(15, 10))
    fig.suptitle('Fire Incident Analysis', fontsize=16)
    
    #Plot 1: Total Acres and Containment by Incident
    x = np.arange(len(incident_names))
    width = 0.35
    
    # Total acres bar
    ax1.bar(x - width/2, total_acres, width, label='Total Acres', color='red', alpha=0.7)
    
    # Containment percentage bar (scaled by corresponding acreage)
    scaled_containment = [(contained / 100) * acres for contained, acres in zip(area_contained, total_acres)]
    ax1.bar(x + width/2, scaled_containment, width, label='Containment % (scaled)', color='green', alpha=0.7)
    
    ax1.set_title('Total Acres and Containment by Incident')
    ax1.set_xlabel('Incident')
    ax1.set_ylabel('Acres / Scaled Percentage')
    ax1.set_xticks(x)
    # Include acres and area contained in x-axis labels
    labels1 = [f"{name}: {acres:,.0f} ({contained}%)" for name, acres, contained in zip(incident_names, total_acres, area_contained)]
    ax1.set_xticklabels(labels1, rotation=45, ha='right')
    ax1.legend()
    #avg_acres = sum(total_acres) / len(total_acres) if total_acres else 0
   # ax1.set_ylim(0, avg_acres)  # Use average with 50% padding
    
    # Plot 2: Personnel by Incident (Total and Change)
    x = np.arange(len(incident_names))
    width = 0.35
    
    ax2.bar(x - width/2, personnel, width, label='Total Personnel', color='blue', alpha=0.7)
    
    # Color change in personnel bars based on positive/negative values
    change_colors = ['red' if val < 0 else 'green' for val in change_personnel]
    ax2.bar(x + width/2, change_personnel, width, label='Change in Personnel', color=change_colors, alpha=0.7)
    
    ax2.set_title('Personnel by Incident')
    ax2.set_xlabel('Incident')
    ax2.set_ylabel('Personnel')
    ax2.set_xticks(x)
    # Include total personnel in x-axis labels
    labels2 = [f"{name}: {p}" for name, p in zip(incident_names, personnel)]
    ax2.set_xticklabels(labels2, rotation=45, ha='right')
    ax2.legend()
    #avg_personnel = sum(personnel + change_personnel) / len(personnel + change_personnel) if (personnel + change_personnel) else 0
    #ax2.set_ylim(0, avg_personnel * 1.5)  # Use average with 50% padding
    
    # Plot 3: Resources Comparison
    x = np.arange(len(incident_names))
    width = 0.25
    
    ax3.bar(x - width, crews, width, label='Crews', color='orange', alpha=0.7)
    ax3.bar(x, engines, width, label='Engines', color='green', alpha=0.7)
    ax3.bar(x + width, helicopters, width, label='Helicopters', color='purple', alpha=0.7)
    
    ax3.set_title('Resources by Incident')
    ax3.set_xlabel('Incident')
    ax3.set_ylabel('Count')
    ax3.set_xticks(x)
    # Simplify x-axis labels to just incident names
    ax3.set_xticklabels(incident_names, rotation=45, ha='right')
    ax3.legend()
    
    # Plot 4: Text Details
    ax4.axis('off')  # Turn off axes for text display
    
    # Create text content for details
    text_content = "Details:\n\n"
    text_content += "Incident          Crews  Engines  Helis  Contained  Total People  Cost to Date\n"
    text_content += "-" * 80 + "\n"
    for i, name in enumerate(incident_names):
        # Truncate long incident names to fit in table format
        short_name = name[:15] if len(name) > 15 else name
        
        # Get additional data
        contained_pct = area_contained[i]
        total_ppl = personnel[i]
        
        # Get CTD value and replace $ with empty string
        ctd_value = str(data[i].get('$$ CTD', '0')).replace('$', '')
        
        text_content += f"{short_name:<15} {crews[i]:>6} {engines[i]:>7} {helicopters[i]:>6} {contained_pct:>9}% {total_ppl:>12} {ctd_value:>12}\n"
    
    # Display the text in the 4th subplot
    ax4.text(0.05, 0.95, text_content, transform=ax4.transAxes, fontsize=10,
             verticalalignment='top', fontfamily='monospace', bbox=dict(boxstyle="round,pad=0.3", facecolor="lightgray", alpha=0.8))
    
    plt.tight_layout()  # Add back tight layout
    plt.show()

data = get_data('data/20250723/regions/Region_1_20250723.json')
visualize_data(data)