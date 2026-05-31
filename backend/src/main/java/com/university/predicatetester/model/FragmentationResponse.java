package com.university.predicatetester.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class FragmentationResponse {
    private List<Predicate> originalPredicates;
    private List<Predicate> minimalPredicates;
    private List<String> dropReasons;
    private List<Minterm> minterms;
    private List<Fragment> fragments;
    private List<Student> students; // Original dataset for reference
}
