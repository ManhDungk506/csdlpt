import csv
import random

def generate_students(filename="students.csv", num_records=30):
    majors = ['CS', 'IT', 'SE', 'IS', 'DS']
    years = ['Freshman', 'Sophomore', 'Junior', 'Senior']
    
    with open(filename, mode='w', newline='', encoding='utf-8') as file:
        writer = csv.writer(file)
        # Write header
        writer.writerow(['ID', 'Name', 'GPA', 'Major', 'Year', 'Credits'])
        
        for i in range(1, num_records + 1):
            student_id = f"S{i:03d}"
            name = f"Student {i}"
            gpa = round(random.uniform(2.0, 4.0), 2)
            major = random.choice(majors)
            year = random.choice(years)
            
            # Basic logic for credits based on year
            if year == 'Freshman':
                credits = random.randint(0, 30)
            elif year == 'Sophomore':
                credits = random.randint(31, 60)
            elif year == 'Junior':
                credits = random.randint(61, 90)
            else:
                credits = random.randint(91, 140)
                
            writer.writerow([student_id, name, gpa, major, year, credits])
            
    print(f"Successfully generated {num_records} student records into {filename}")

if __name__ == "__main__":
    generate_students()
