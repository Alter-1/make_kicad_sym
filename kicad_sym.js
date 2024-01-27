// Global variables
let name = "MySymbol";
let font = 1.27;
let size = [0, 0];
let step = 0;
let side = '';
let num = 1;
let dnum = 1;
let direction = 0;
let x = 0, y = 0;
let pos_cache = {};  // Cache for storing positions based on size
let props = {};      // Properties
let prop_pos = 0;

const keywords = ['name', 'size', 'sizep', 'step', 'side', 'num', 'rnum', 'font', 'prop'];

function split_by_whitespace_or_comma(s) {
    return s.split(/[\s,]+/);
}

function parse_line(line) {
    const parts = line.split(/\s+/);
    const key = parts[0].replace(':', ''); // Remove the colon

    if (keywords.includes(key)) {
        return [key, parts.slice(1).join(' ')];
    } else {
        return ['pin', parts.join(' ')];
    }
}

function update_globals(key, value) {
    if (key === 'size') {
        const new_size = value.split(/[\s,]+/).map(Number);
        size = new_size;
    } else if (key === 'sizep') {
        const new_size = value.split(/[\s,]+/).map(Number);
        size = [Math.round((new_size[0] / 2 + 1) * 2 * step),
                Math.round((new_size[1] / 2 + 1) * 2 * step)];
    } else if (key === 'step') {
        step = parseFloat(value);
    } else if (key === 'font') {
        font = parseFloat(value);
    } else if (key === 'side') {
        reset_position(value);  // Assuming reset_position is defined
        side = value;
    } else if (key === 'num') {
        num = parseInt(value, 10);
        dnum = 1;
    } else if (key === 'rnum') {
        num = parseInt(value, 10);
        dnum = -1;
    } else if (key === 'name') {
        name = value;
    } else if (key === 'prop') {
        const a = value.split(/[\s,]+/, 2);
        if (a.length === 2) {
            props[a[0]] = a[1];
        }
    }
}

function cache_current_position() {
    pos_cache[side] = { x: x, y: y, direction: direction };  // Assuming pos_cache, side, x, y, direction are global
}

function reset_position(new_side) {
    if (side === new_side) {
        return;
    }
    if (pos_cache.hasOwnProperty(new_side)) {
        const cached = pos_cache[new_side];
        x = cached.x;
        y = cached.y;
        direction = cached.direction;
    } else {
        if (side !== '') {
            cache_current_position();
        }
        if (new_side === 'L') {
            x = -size[0] / 2 - step;
            y = size[1] / 2 - step;
            direction = 0;
        } else if (new_side === 'R') {
            x = size[0] / 2 + step;
            y = size[1] / 2 - step;
            direction = 180;
        } else if (new_side === 'T') {
            x = -size[0] / 2 + step;
            y = size[1] / 2 + step;
            direction = 270;
        } else if (new_side === 'B') {
            x = -size[0] / 2 + step;
            y = -size[1] / 2 - step;
            direction = 90;
        }
    }
    side = new_side;  // Update the global variable 'side' to the new side
}

function calculate_position() {
    let position = { x: x, y: y };  // Assuming x, y, and side are global variables

    if (side === 'L' || side === 'R') {
        y -= step;  // Assuming step is a global variable
    } else {  // 'T' or 'B'
        x += step;
    }

    return position;
}

function print_prop(prop_name, val, col = -1, row = -1, hide = true) {
    let display = "hide";
    let x = font;  // Assuming 'font' is a global variable
    let y = prop_pos;  // Assuming 'prop_pos' is a global variable

    if (row !== -1) {
        y = round(size[1] / 2 + step - (step * row), 2);  // Assuming 'size' and 'step' are global variables
    }
    if (col !== -1) {
        x = round(-size[0] / 2 + step + (step * col), 2);  // Assuming 'size' and 'step' are global variables
    }

    if (!hide) {
        display = "(justify left)";
    }

    let s = `    (property "${prop_name}" "${val}" (at ${x} ${y.toFixed(2)} 0)\n` +
            `      (effects (font (size ${font} ${font})) ${display})\n` +
            `    )\n`;

    prop_pos = y - step * 2;  // Update global 'prop_pos'
    return s;
}

function generate_rectangle_record(_name, step, size) {
    const TLx = round(-size[0] / 2, 2);
    const TLy = round(size[1] / 2, 2);
    const BRx = round(size[0] / 2, 2);
    const BRy = round(-size[1] / 2, 2);

    let s = "";

    for (const [key, prop_v] of Object.entries(props)) {
        let row = -1;
        let col = -1;
        let hide = (key !== "Reference");
        if (key === "Reference") {
            row = 1;
            col = 0;
        }
        if (key === "Value") {
            name = prop_v; // Assuming 'name' is a global variable
            _name = prop_v;
            continue;
        }
        s += print_prop(key, prop_v, col, -1, hide); // Assuming print_prop is defined
    }

    s += print_prop("Value", name, 0, -1, false); // Assuming print_prop is defined

    return s + 
           `    (symbol "${name}_0_1"\n` +
           `      (rectangle (start ${TLx.toFixed(2)} ${TLy.toFixed(2)}) (end ${BRx.toFixed(2)} ${BRy.toFixed(2)})\n` +
           `        (stroke (width ${round(step / 10, 3).toFixed(2)}) (type default))\n` +
           `        (fill (type background))\n` +
           `      )\n` +
           `    )\n`;
}

function generate_pin_records(name, step, pin_data) {
    let pin_records = '';
    for (let i = 0; i < pin_data.length; i++) {
        const [num, pin_name, pin_type, x, y, direction] = pin_data[i];
        const x_rounded = round(x, 2);
        const y_rounded = round(y, 2);
        const step_rounded = round(step, 2);
        // Assuming 'font' is a globally defined variable
        pin_records += `      (pin ${pin_type} line (at ${x_rounded.toFixed(2)} ${y_rounded.toFixed(2)} ${direction} ) (length ${step_rounded.toFixed(2)})\n` +
                       `        (name "${pin_name}" (effects (font (size ${font.toFixed(2)} ${font.toFixed(2)}))))\n` +
                       `        (number "${num}" (effects (font (size ${font.toFixed(2)} ${font.toFixed(2)}))))\n` +
                       `      )\n`;
    }
    return `    (symbol "${name}_1_1"\n${pin_records}\n    )\n`;
}

const pin_type_map = {
    'i': 'input',
    'o': 'output',
    'io': 'bidirectional',
    'vin': 'power_in',
    'v': 'power_in',
    'n': 'passive',
    '-': 'passive',
    'vout': 'power_out',
    'nc': 'no_connect'
};

function map_pin_type(pin_type) {
    pin_type = pin_type.toLowerCase();
    return pin_type_map[pin_type] || pin_type;
}

function processInput() {
    const input = document.getElementById('inputArea').value;
    const lines = input.split('\n');
    let results = []; // Assuming results is an array

    for (let line of lines) {
        line = line.trim();
        if (line.length === 0 || line[0] === '#') continue;
        if (line === '-' || line === '--') {
            calculate_position();
            continue;
        }

        let [key, value] = parse_line(line); // You need to define parse_line
        if (key !== 'pin') {
            update_globals(key, value); // You need to define update_globals
        } else {
            let [pin_name, pin_type] = value.split(' '); // Assuming value is a space-separated string
            pin_type = map_pin_type(pin_type); // You need to define map_pin_type
            let position = calculate_position(); // You need to define calculate_position
            results.push([num, pin_name, pin_type, round(position.x, 2), round(position.y, 2), direction]);
            num += dnum; // Assuming num and dnum are defined and updated elsewhere
        }
    }

    return results
}

function make_kicad_sym(results) {
    // Create a downloadable file with the output

    prop_pos = round(size[1] / 2, 2) + step;  // Assuming prop_pos, size, and step are globally defined

    let output = `(kicad_symbol_lib (version 20220914) (generator make_kicad_sym.js)\n` +
                 `  (symbol "${name}" (in_bom yes) (on_board yes)\n`;  // Assuming name is globally defined

    output += generate_rectangle_record(name, step, size);  // Assuming generate_rectangle_record is defined
    output += generate_pin_records(name, step, results);    // Assuming generate_pin_records is defined

    output += '  )\n)\n';

    createDownloadableFile(output);
}

// Helper function for rounding numbers
function round(value, decimals) {
    return Number(Math.round(value + 'e' + decimals) + 'e-' + decimals);
}

function createDownloadableFile(data) {
    const filename = name + ".kicad_sym";  // Construct the filename
    const blob = new Blob([data], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;  // Set the download attribute to the dynamic filename
    a.click();
    window.URL.revokeObjectURL(url);
}

function drawPreview(results) {
    const canvas = document.getElementById('previewCanvas');
    const ctx = canvas.getContext('2d');

    // Clear previous drawing
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Assume size[0] is the width and size[1] is the height of the box
    // Scale factors (adjust as necessary)
    const scaleX = canvas.width / (size[0] + step * 4);
    const scaleY = canvas.height / (size[1] + step * 4);

    // Draw the box
    ctx.strokeRect(
        (canvas.width - size[0] * scaleX) / 2, 
        (canvas.height - size[1] * scaleY) / 2, 
        size[0] * scaleX, 
        size[1] * scaleY
    );

    // Draw the pin names
    results.forEach(([num, pin_name, pin_type, x, y, direction]) => {
        //const scaledX = x * scaleX + canvas.width / 2;
        //const scaledY = y * scaleY + canvas.height / 2;
        const scaledX = x * scaleX + canvas.width / 2;
        const scaledY = canvas.height - (y * scaleY + canvas.height / 2);  // Flip Y-coordinate

        // Set text alignment
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        // Rotate text for vertical pins (direction 90 or 270)
        if (direction === 90 || direction === 270) {
            ctx.save();
            ctx.translate(scaledX, scaledY);
            ctx.rotate(direction * Math.PI / 180);
            ctx.fillText(pin_name, 0, 0);
            ctx.restore();
        } else {
            ctx.fillText(pin_name, scaledX, scaledY);
        }
    });
}

// Call this function whenever you need to update the preview
function DoPreview() {
    let results = processInput();
    drawPreview(results);
}

function DoDownload() {
    let results = processInput();
    make_kicad_sym(results);
}
