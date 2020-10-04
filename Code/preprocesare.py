import os
import numpy as np
from PIL import Image

if __name__ == '__main__':
	im_list = []
	crop_format = (0, 60, 4096, 1660)
	desired_im_sz = (1024, 400)

	#De modificat cele 4 cai si numarul de Video-uri dupa caz
	src_path = 'D:\\pozeNASA\\GAN_frame_pred\\Data\\Train_old\\Video_'   #'C:\\Users\\Silviu\\Desktop\\ML\\NASA_Spaceapps_2020\\Data\\Train_old\\Video_' # Pozele de procesat
	dest_path = 'D:\\pozeNASA\\GAN_frame_pred\\Data\\Train\\Video_'    #'C:\\Users\\Silviu\\Desktop\\ML\\NASA_Spaceapps_2020\\Data\\Train\\Video_' # Unde se va salva
	mask_path = 'D:\\pozeNASA\\GAN_frame_pred\\masca\\masca\\masca.jpg' # Calea catre masca
	fill_path = 'D:\\pozeNASA\\GAN_frame_pred\\fill\\fill.jpg' # Calea catre harta de fill
	nr_videos = 45
	
	threshold = 20 / 255
	
	mask = Image.open(mask_path).crop(crop_format)
	mask = np.asarray(mask)
	mask = np.float32(mask) / 255;
	
	fill = Image.open(fill_path).crop(crop_format)
	fill = np.asarray(fill)
	fill = np.float32(fill) / 255;
	
	fill_logic = fill.mean(axis = 2)
	fill_logic = np.greater(fill_logic, threshold)
	
	nr_videos += 1
		
	for i in range(1, nr_videos):
		video_src_path = src_path + str(i) + '\\'
		video_dest_path = dest_path + str(i) + '\\'
		files = list(os.walk(video_src_path, topdown=False))[-1][-1]
		im_list = sorted(files)

		for im_file in im_list:
			image = Image.open(video_src_path + im_file).crop(crop_format)		
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
			image.save(video_dest_path + im_file, 'JPEG')
		print('Gata Video_' + str(i))
