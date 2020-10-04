import os
import numpy as np
from PIL import Image

desired_im_sz = (400, 1024)

if __name__ == '__main__':
	im_list = []

	#De modificat cele 3 cai
	src = 'C:\\Users\\Silviu\\Desktop\\ML\\NASA_Spaceapps_2020\\GAN_frame_pred\\Data\\Testing\\Video_'
	dst = 'C:\\Users\\Silviu\\Desktop\\ML\\NASA_Spaceapps_2020\\GAN_frame_pred\\Data\\Test\\Video_'

	for i in range(1, 13):
		src_img = src + str(i) + '\\'
		dst_img = dst + str(i) + '\\'

		files = list(os.walk(src_img, topdown=False))[-1][-1]
		im_list = sorted(files)

		print( 'Creating ' + str(len(im_list)) + ' images')

		for im_file in im_list:
			image = Image.open(src_img + im_file)
			image = image.resize((desired_im_sz[1], desired_im_sz[0]))
			image.save(dst_img + im_file, 'JPEG')
