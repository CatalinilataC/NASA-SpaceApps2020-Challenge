import sys
import csv
import os
import numpy as np
from PIL import Image

# Exemplu pentru rulare:
# python detect.py C:\\Users\\Silviu\\Desktop\\ML\\NASA_Spaceapps_2020\\sa_vedem\\ C:\\Users\\Silviu\\Desktop\\ML\\NASA_Spaceapps_2020\\sa_nu_vedem\\ 1.1
# val limita intre 1 si 3 inclusiv
if __name__ == '__main__':

	 
	src_path = sys.argv[1] # Pozele de procesat
	dest_path = sys.argv[2] # Unde se va salva
	small_mask_path = 'small_mask.jpg' # Calea catre masca
	coords = np.load('coords.npy') # Calea catre coordonate

	mask = Image.open(small_mask_path)
	mask = np.asarray(mask)
	mask = np.float32(mask) / 255;

	fill = np.float32(np.asarray([[[1, 0, 0]]]))
	threshold_ratio = np.double(sys.argv[3]) # intre 1 si 3 inclusiv
	threshold_min_val = 60 / 255
	eps = 1e-6
	
	files = list(os.walk(src_path, topdown=False))[-1][-1]
	im_list = sorted(files)
	
	for index, im_file in enumerate(im_list):
		image = Image.open(src_path + im_file)
		image = np.asarray(image) / 255
		image = np.float32(image)
				
		image_logic = (image[..., 0] + eps) / (image[..., 1] + image[..., 2] + 3 * eps)
		image_logic = image_logic * np.greater(image[..., 0], threshold_min_val)
		image_logic = np.greater(image_logic, threshold_ratio)

		image = image * np.logical_not(image_logic)[..., np.newaxis] + fill * image_logic[..., np.newaxis] * mask
		
		image *= 255
		image = Image.fromarray(np.uint8(image))
		image.save(dest_path + 'image_' + str(index) + '.jpg', 'JPEG')
		
		new_coords = coords * image_logic[..., np.newaxis]
		new_coords = new_coords.reshape(new_coords.shape[0] * new_coords.shape[1], new_coords.shape[2]).tolist()
		final_coords = [coord for coord in new_coords if coord[0] + coord[1] != 0]

		with open(dest_path + 'coords_' + str(index) + '.csv', 'w', newline='') as myfile:
			wr = csv.writer(myfile, quoting=csv.QUOTE_ALL)
			wr.writerow(final_coords)

