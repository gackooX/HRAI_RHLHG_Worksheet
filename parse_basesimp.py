import re
import json

input_file = "Foundation/BSMCFG_English_2015.TXT"
output_file = "src/data/foundationCodes.json"

foundation_codes = []

with open(input_file, 'r', encoding='latin-1') as f:
    lines = f.readlines()

current_code = None
current_desc = []
current_rsi = 0.0

start_parsing = False

for line in lines:
    line = line.strip()

    if "Configuration: #" in line and "BCIN_1" in line:
        start_parsing = True

    if not start_parsing:
        continue

    config_match = re.search(r'Configuration:\s*#\s*\d+\s*=\s*([A-Z0-9_a-z]+)(?:\s+([\d.]+))?', line)

    if config_match:
        if current_code:
            foundation_codes.append({
                "code": current_code,
                "description": "\n".join(current_desc),
                "rsi": current_rsi
            })

        current_code = config_match.group(1)
        rsi_str = config_match.group(2)
        if rsi_str:
            current_rsi = float(rsi_str)
        else:
            current_rsi = 0.0
        current_desc = []
    elif current_code and line.startswith('-'):
        current_desc.append(line.lstrip('- '))

if current_code:
    foundation_codes.append({
        "code": current_code,
        "description": "\n".join(current_desc),
        "rsi": current_rsi
    })

with open(output_file, 'w', encoding='utf-8') as f:
    json.dump(foundation_codes, f, indent=2)

print(f"Parsed {len(foundation_codes)} foundation configurations into {output_file}.")
