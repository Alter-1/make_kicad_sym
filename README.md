## About

*make_kicad_sym.py* generates KiCad7 symbol files from simplified chip pinout description.
Just specify chip name, size and describe pins one by one for each side. See example below

## Input File Format Description

### Component Name
- **Keyword**: `name:`
- **Example**: `name: ESP32-WT32-S1`
- **Description**: Defines the component's name.

### Properties
- **Keyword**: `prop:`
- **Example**: `prop: Reference U`
- **Description**: Sets various properties, like reference, footprint, datasheet link, keywords, and description.

### Font Size
- **Keyword**: `font:`
- **Example**: `font: 1.27`
- **Description**: Specifies the font size for the component representation.

### Step Size
- **Keyword**: `step:`
- **Example**: `step: 2.45`
- **Description**: Defines the step size for calculating pin positions.

### Component Size
- **Keyword**: `sizep:`
- **Example**: `sizep: 17 17`
- **Description**: Specifies component width and height, calculated based on the step size.

### Pin Side and Configuration
- **Keywords**: `side:`, `[Pin Name] [Pin Type]`
- **Examples**: `side: L`, `GPIO36 i`
- **Description**: Sets the side for pin definitions and defines each pin with its name and type.

### Direct Numbering
- **Keyword**: `num:`
- **Example**: `num: 1`
- **Description**: Restarts pin numbering from the specified number, incrementing for each subsequent pin.

### Reverse Numbering
- **Keyword**: `rnum:`
- **Example**: `rnum: 31`
- **Description**: Restarts pin numbering from the specified number, decrementing for each subsequent pin.

### Skipping Positions
- **Keyword**: `--`
- **Description**: Skips a single position without affecting the numbering.

### Pin Types
Pin types can be specific KiCad keywords like 'input', 'output', 'bidirectional', etc., or shortcuts:
- `i` for input
- `o` for output
- `io` for bidirectional
- `vin` for power_in (also `v`)
- `n` for passive (also `-`)
- `vout` for power_out

### Positioning
Pins are positioned sequentially from top to bottom and left to right, following the order of their definition under each `side:` directive.

## Example 

'''
name: ESP32-WT32-S1

prop: Reference U
prop: Footprint RF_Module:ESP32-WT32-S1
prop: Datasheet https://datasheet.lcsc.com/lcsc/2001060933_Wireless-tag-WT32-S1_C477832.pdf
prop: ki_keywords RF Radio BT ESP ESP32 Espressif Ethernet external U.FL antenna
prop: ki_description RF Module, ESP32-D0WD SoC, Wi-Fi 802.11b/g/n, Bluetooth, BLE, Ethernet RMII, 32-bit, 2.7-3.6V, PCB antenna, SMD
prop: ki_fp_filters ESP32?WT32?S1*

font: 1.27
step: 2.54
sizep: 12 12

side: L
EN  input
GPIO36  i
GPIO38  i
GPIO39  i
GPIO34  i

GPIO37  i
GPIO35  i
GPIO32  i
GPIO33  i

GPIO25  io
GPIO26  io

side: B
--
--
GPIO27  io
GPIO14  io
GPIO12  io
GPIO13  io

GPIO15  io
GPIO2  io
GPIO0  io
GPIO4  io

GPIO16  io

side: R
rnum: 31
GND -
GPIO21  io
U0TX/GPIO1 io
U0RX/GPIO3 io

GPIO22  io
GPIO19  io
GPIO23  io
GPIO18  io

GPIO5  io
GPIO17  io
VDD  vin
'''

## Usage 

python kicad_symbol_generator.py esp32-wt32-s1.sym.in > esp32-wt32-s1.kicad_sym
    or
python kicad_symbol_generator.py esp32-wt32-s1.sym.in esp32-wt32-s1.csv

