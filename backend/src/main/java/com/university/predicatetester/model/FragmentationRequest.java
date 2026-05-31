package com.university.predicatetester.model;

import lombok.Data;
import java.util.List;

@Data
public class FragmentationRequest {
    private List<String> predicates; // Array of strings like "GPA > 3.5"
}
