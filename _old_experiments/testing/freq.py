import math

def frequency_to_wavetable_index(frequency, f_min, f_max, num_wavetables):
    # Calculate the logarithmic values using natural logarithm
    log_f_min = math.log(f_min) / math.log(2.0)
    log_f_max = math.log(f_max) / math.log(2.0)
    log_f = math.log(frequency) / math.log(2.0)
    
    # Calculate the index based on logarithmic scaling
    index = int((log_f - log_f_min) / (log_f_max - log_f_min) * (num_wavetables - 1))
    
    # Ensure the index is within bounds
    if index < 0:
        return 0
    
    if index >= num_wavetables:
        return num_wavetables - 1
    
    return index

def wavetable_index_to_max_frequency(index, f_min, f_max, num_wavetables):
    # Calculate the logarithmic values
    log_f_min = math.log2(f_min)
    log_f_max = math.log2(f_max)
    
    # Calculate the logarithmic value for the given index
    log_f = log_f_min + (index + 1) * (log_f_max - log_f_min) / num_wavetables
    
    # Convert the logarithmic value back to the frequency domain
    frequency = 2 ** log_f
    
    return frequency

f_min = 20
f_max = 4186.0
num_wavetables = 32

# Test with various frequencies
test_frequencies = [(i + 1) * 10 for i in range(10)] + [(i + 1) * 100 for i in range(50)]

# Print the corresponding wavetable indices for these frequencies
for freq in test_frequencies:
    index = frequency_to_wavetable_index(freq, f_min, f_max, num_wavetables)
    print(f"Frequency {freq} Hz -> Wavetable Index: {index}")

for index in range(num_wavetables):
    max_freq = wavetable_index_to_max_frequency(index, f_min, f_max, num_wavetables)
    print(f"Wavetable Index: {index} -> Maximum Frequency: {max_freq:.2f} Hz")
