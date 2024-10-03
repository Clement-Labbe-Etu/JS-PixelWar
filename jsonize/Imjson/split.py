def split_line(line, chunk_size):
    chunks = [line[i:i+chunk_size] for i in range(0, len(line), chunk_size)]
    return chunks

def main(input_file, output_file, chunk_size=100):
    with open(input_file, 'r') as f:
        data = f.read().strip()  
        data = data.replace(" ", "")  

    segments = data.split(',')  

    output_lines = []
    for i in range(0, len(segments), chunk_size):
        chunk = segments[i:i+chunk_size]  
        output_lines.append(','.join(chunk))  

    with open(output_file, 'w') as f:
        f.write('\n'.join(output_lines))

if __name__ == "__main__":
    input_file = "input.txt"
    output_file = "output.txt"
    chunk_size = 100
    main(input_file, output_file, chunk_size)
