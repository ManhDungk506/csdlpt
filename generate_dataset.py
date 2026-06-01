import csv
import random

def generate_students(filename="students.csv", num_records=30):
    majors = ['CS', 'IT', 'SE', 'IS', 'DS']
    years = ['Freshman', 'Sophomore', 'Junior', 'Senior']
    
    with open(filename, mode='w', newline='', encoding='utf-8') as file:
        writer = csv.writer(file)
        writer.writerow(['ID', 'Name', 'GPA', 'Major', 'Year', 'Credits'])
        
        for i in range(1, num_records + 1):
            student_id = f"S{i:03d}"
            name = f"Student {i}"
            gpa = round(random.uniform(2.0, 4.0), 2)
            major = random.choice(majors)
            year = random.choice(years)
            credits = random.randint(30, 120)
            
            writer.writerow([student_id, name, gpa, major, year, credits])

if __name__ == "__main__":
    generate_students()
    print("Dataset generated successfully in students.csv")
