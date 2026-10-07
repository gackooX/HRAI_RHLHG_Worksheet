with open('src/utils/calculations.js', 'r') as f:
    lines = f.readlines()

new_lines = []
in_conflict = False
keep = False

for line in lines:
    if line.startswith('<<<<<<< HEAD'):
        in_conflict = True
        keep = False
    elif line.startswith('======='):
        keep = True
    elif line.startswith('>>>>>>>'):
        in_conflict = False
    else:
        if not in_conflict or keep:
            new_lines.append(line)

with open('src/utils/calculations.js', 'w') as f:
    f.writelines(new_lines)
