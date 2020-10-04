import sys
import os
import numpy as np
from PIL import Image

# Exemplu pentru rulare:
# python preprocesare.py C:\\Users\\Silviu\\Desktop\\ML\\NASA_Spaceapps_2020\\GAN_frame_pred\\Data\\Test_old\\Video_1\\ C:\\Users\\Silviu\\Desktop\\ML\\NASA_Spaceapps_2020\\GAN_frame_pred\\Data\\Test\\Video_1\\

if __name__ == '__main__':
	im_list = []
	crop_format = (0, 60, 4096, 1660)
	desired_im_sz = (1024, 400)

	#De modificat cele 4 cai si numarul de Video-uri dupa caz
	src_path = sys.argv[1] # Pozele de procesat
	dest_path = sys.argv[2] # Unde se va salva
	mask_path = 'D:\\projects_node\\nasa_interface\\process_files\\masca.jpg' # Calea catre masca
	fill_path = 'D:\\projects_node\\nasa_interface\\process_files\\fill.jpg' # Calea catre harta de fill
	
	threshold = 20 / 255
	
	mask = Image.open(mask_path).crop(crop_format)
	mask = np.asarray(mask)
	mask = np.float32(mask) / 255;
	
	fill = Image.open(fill_path).crop(crop_format)
	fill = np.asarray(fill)
	fill = np.float32(fill) / 255;
	
	fill_logic = fill.mean(axis = 2)
	fill_logic = np.greater(fill_logic, threshold)
	
	files = list(os.walk(src_path, topdown=False))[-1][-1]
	im_list = sorted(files)

	for im_file in im_list:
		image = Image.open(src_path + im_file)
		image = image.crop(crop_format)		
		image = np.asarray(image)
		image = np.float32(image) / 255
		
		image = np.multiply(image, mask)
		
		image_logic = image.mean(axis = 2)
		image_logic = np.less(image_logic, threshold)
		
		comparison = np.logical_and(image_logic, fill_logic)
		fill_rest = fill * comparison[..., np.newaxis]
		image = image * np.logical_not(image_logic)[..., np.newaxis] + fill_rest
		
		image *= 255	
		image = Image.fromarray(np.uint8(image))
		image = image.resize(desired_im_sz, resample=Image.NEAREST)
		image.save(dest_path + im_file, 'JPEG')
