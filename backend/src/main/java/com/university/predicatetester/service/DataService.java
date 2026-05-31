package com.university.predicatetester.service;

import com.university.predicatetester.model.Student;
import org.springframework.stereotype.Service;
import jakarta.annotation.PostConstruct;
import java.io.BufferedReader;
import java.io.FileReader;
import java.util.ArrayList;
import java.util.List;

@Service
public class DataService {
    
    private List<Student> students = new ArrayList<>();

    @PostConstruct
    public void init() {
        loadStudentsFromCsv("../students.csv");
    }

    private void loadStudentsFromCsv(String filePath) {
        try (BufferedReader br = new BufferedReader(new FileReader(filePath))) {
            String line;
            boolean firstLine = true;
            while ((line = br.readLine()) != null) {
                if (firstLine) {
                    firstLine = false;
                    continue; // Skip header
                }
                String[] values = line.split(",");
                if (values.length >= 6) {
                    Student student = new Student(
                        values[0].trim(),
                        values[1].trim(),
                        Double.parseDouble(values[2].trim()),
                        values[3].trim(),
                        values[4].trim(),
                        Integer.parseInt(values[5].trim())
                    );
                    students.add(student);
                }
            }
            System.out.println("Loaded " + students.size() + " students.");
        } catch (Exception e) {
            System.err.println("Error loading CSV: " + e.getMessage());
        }
    }

    public List<Student> getStudents() {
        return students;
    }
}
