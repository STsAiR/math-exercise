# help make dir naming from 2012 to 2025
#!/bin/bash
# Usage: ./main.sh <start_year> <end_year>
start_year=${1:-2012}
end_year=${2:-2025}
# Check if the start year is less than the end year
if [[ $start_year -ge $end_year ]]; then
  echo "Error: Start year must be less than end year."
  exit 1
fi
# Create directories for each year in the range from start_year to end_year
for year in $(seq $start_year $end_year); do
  dir_name="$year"
  if [[ ! -d $dir_name ]]; then
    mkdir "$dir_name"
    echo "Created directory: $dir_name"
  else
    echo "Directory already exists: $dir_name"
  fi
done
# Create a README file in each directory

