package com.university.predicatetester.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class Fragment {
    private String id;
    private Minterm minterm;
    private List<Student> students;
}
