package com.university.predicatetester.service;

import com.university.predicatetester.model.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.File;
import java.io.FileWriter;
import java.io.BufferedReader;
import java.io.FileReader;
import java.io.IOException;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class FragmentationService {

    @Autowired
    private DataService dataService;

    public FragmentationResponse processFragmentation(FragmentationRequest request) {
        clearSitesDirectory();
        
        List<Student> students = dataService.getStudents();
        
        // 1. Parse Predicates
        List<Predicate> originalPredicates = new ArrayList<>();
        int idCounter = 1;
        for (String pText : request.getPredicates()) {
            originalPredicates.add(Predicate.parse("p" + idCounter++, pText));
        }
        
        // 2. Check Minimality
        List<Predicate> minimalPredicates = new ArrayList<>();
        List<String> dropReasons = new ArrayList<>();
        
        // Start with empty, add one by one if relevant, or start with full and remove.
        // The standard way: A set of predicates Pr is minimal if every p in Pr is relevant.
        // We will filter the original list.
        List<Predicate> currentSet = new ArrayList<>(originalPredicates);
        Iterator<Predicate> iterator = currentSet.iterator();
        while (iterator.hasNext()) {
            Predicate p = iterator.next();
            // Check if p is relevant with respect to currentSet \ {p}
            List<Predicate> others = new ArrayList<>(currentSet);
            others.remove(p);
            
            boolean isRelevant = false;
            
            // If there are no other predicates, check if p splits the whole dataset
            if (others.isEmpty()) {
                boolean hasTrue = false;
                boolean hasFalse = false;
                for (Student s : students) {
                    if (p.evaluate(s)) hasTrue = true;
                    else hasFalse = true;
                }
                isRelevant = hasTrue && hasFalse;
            } else {
                // Generate all valid minterms of 'others' over the dataset
                List<Minterm> otherMinterms = generateValidMinterms(others, students);
                for (Minterm m : otherMinterms) {
                    // Check if p splits this minterm m
                    boolean hasTrue = false;
                    boolean hasFalse = false;
                    for (Student s : students) {
                        if (m.evaluate(s)) {
                            if (p.evaluate(s)) hasTrue = true;
                            else hasFalse = true;
                        }
                    }
                    if (hasTrue && hasFalse) {
                        isRelevant = true;
                        break;
                    }
                }
            }
            
            if (!isRelevant) {
                dropReasons.add("Loại bỏ [" + p.getText() + "] vì nó dư thừa (không giúp phân mảnh thêm dữ liệu hoặc gây mâu thuẫn).");
                iterator.remove(); // Remove from currentSet
            }
        }
        minimalPredicates = currentSet;

        // 3. Generate Final Minterms from Minimal Predicates
        List<Minterm> finalMinterms = generateValidMinterms(minimalPredicates, students);
        
        // 4. Fragment Data
        List<Fragment> fragments = new ArrayList<>();
        int fCounter = 1;
        for (Minterm m : finalMinterms) {
            List<Student> fStudents = new ArrayList<>();
            for (Student s : students) {
                if (m.evaluate(s)) {
                    fStudents.add(s);
                }
            }
            if (!fStudents.isEmpty()) {
                Fragment fragment = new Fragment("F" + fCounter++, m, fStudents);
                fragments.add(fragment);
                exportFragmentToCsv(fragment);
            }
        }
        
        return new FragmentationResponse(
            originalPredicates,
            minimalPredicates,
            dropReasons,
            finalMinterms,
            fragments,
            students
        );
    }
    
    private List<Minterm> generateValidMinterms(List<Predicate> predicates, List<Student> dataset) {
        List<Minterm> validMinterms = new ArrayList<>();
        int numPredicates = predicates.size();
        int totalCombinations = 1 << numPredicates; // 2^n
        
        for (int i = 0; i < totalCombinations; i++) {
            Map<String, Boolean> signs = new HashMap<>();
            StringBuilder textBuilder = new StringBuilder();
            
            for (int j = 0; j < numPredicates; j++) {
                Predicate p = predicates.get(j);
                boolean isPositive = (i & (1 << j)) != 0;
                signs.put(p.getId(), isPositive);
                
                if (j > 0) textBuilder.append(" AND ");
                if (!isPositive) textBuilder.append("NOT ");
                textBuilder.append("(").append(p.getText()).append(")");
            }
            
            Minterm m = new Minterm("m" + (i + 1), predicates, signs, textBuilder.toString());
            
            // Check if this minterm is valid (contains at least one tuple)
            boolean isValid = false;
            for (Student s : dataset) {
                if (m.evaluate(s)) {
                    isValid = true;
                    break;
                }
            }
            if (isValid) {
                validMinterms.add(m);
            }
        }
        return validMinterms;
    }

    private void clearSitesDirectory() {
        File dir = new File("sites");
        if (dir.exists() && dir.isDirectory()) {
            File[] files = dir.listFiles((d, name) -> name.startsWith("Site_") && name.endsWith(".csv"));
            if (files != null) {
                for (File f : files) {
                    f.delete();
                }
            }
        }
    }

    private void exportFragmentToCsv(Fragment fragment) {
        File dir = new File("sites");
        if (!dir.exists()) {
            dir.mkdirs();
        }
        
        File file = new File(dir, "Site_" + fragment.getId() + ".csv");
        try (FileWriter writer = new FileWriter(file)) {
            writer.write("ID,Name,GPA,Major,Year,Credits\n");
            for (Student s : fragment.getStudents()) {
                writer.write(s.getId() + "," + s.getName() + "," + s.getGpa() + "," +
                             s.getMajor() + "," + s.getYear() + "," + s.getCredits() + "\n");
            }
        } catch (IOException e) {
            System.err.println("Failed to export " + fragment.getId());
        }
    }

    public List<Student> reconstruct() {
        List<Student> allStudents = new ArrayList<>();
        File dir = new File("sites");
        if (dir.exists() && dir.isDirectory()) {
            File[] files = dir.listFiles((d, name) -> name.startsWith("Site_") && name.endsWith(".csv"));
            if (files != null) {
                for (File f : files) {
                    try (BufferedReader br = new BufferedReader(new FileReader(f))) {
                        String line;
                        boolean first = true;
                        while ((line = br.readLine()) != null) {
                            if (first) { first = false; continue; }
                            String[] parts = line.split(",");
                            if (parts.length >= 6) {
                                allStudents.add(new Student(
                                    parts[0], parts[1], Double.parseDouble(parts[2]),
                                    parts[3], parts[4], Integer.parseInt(parts[5])
                                ));
                            }
                        }
                    } catch (IOException e) {
                        e.printStackTrace();
                    }
                }
            }
        }
        // Sort by ID to restore original order
        allStudents.sort(Comparator.comparing(Student::getId));
        return allStudents;
    }

    public boolean deleteSite(String fragmentId) {
        File file = new File("sites/Site_" + fragmentId + ".csv");
        if (file.exists()) {
            return file.delete();
        }
        return false;
    }
}
