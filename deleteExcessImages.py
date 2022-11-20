import os
from pprint import pprint

# iterate 2022_11_16
# D:Gigapixel/2022_11_16
# D:Gigapixel/2022_01_30/__scaled/scaled_ -art-scale-4_00x
# scaled_ambitions-cost_d0a3df66-1c07-48c4-bda6-8fe94a60ab6a-art-scale-4_00x
scaled_path = "/mnt/d/Gigapixel/2022_11_06/__scaled"
original_images = "/mnt/d/Gigapixel/2022_11_16"

for (i, file_name) in enumerate(os.listdir(original_images)):
    if (os.path.isfile(f"{original_images}/{file_name}")):
        print(i)
        name, mime = file_name.split(".")

        scaled_file_name = f"{scaled_path}/scaled_{name}-art-scale-4_00x.png"
        # pprint(scaled_file_name)
        # pprint(os.path.isfile(scaled_file_name))
        if os.path.isfile(scaled_file_name):
            pprint(scaled_file_name)
            os.remove(scaled_file_name)
            pprint(os.path.isfile(scaled_file_name))
        
        