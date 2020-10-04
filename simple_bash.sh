#!/bin/bash         
#echo "/home/srv/nasa_interface/uploads/director$1/"
counter=0
userCounter=""
dayNb=0
input="/home/srv/nasa_interface/numbers.txt"

while IFS= read -r line
do
counter=$((counter+1))

if [ "$counter" -eq 1 ]
then
    userCounter=$line
else
    dayNb=$line
fi

done < "$input"


echo $dayNb

python3 "/home/srv/nasa_interface/process_files/preprocesare.py" "/home/srv/nasa_interface/uploads/director$userCounter/" "/home/srv/nasa_interface/uploads/Video1/"

rm -rf "/home/srv/nasa_interface/uploads/director$userCounter"

python3 "/home/srv/nasa_interface/predictor/Code/avg_runner.py" -t "/home/srv/nasa_interface/uploads/" -T -n "utilizator1" --recursion="$dayNb"


python3 "/home/srv/nasa_interface/process_files/detect.py" "/home/srv/nasa_interface/Save/utilizator1/" "/home/srv/nasa_interface/FINAL_DESTINATION/" 1