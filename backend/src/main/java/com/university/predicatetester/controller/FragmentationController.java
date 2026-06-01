package com.university.predicatetester.controller;

import com.university.predicatetester.model.FragmentationRequest;
import com.university.predicatetester.model.FragmentationResponse;
import com.university.predicatetester.model.Student;
import com.university.predicatetester.service.DataService;
import com.university.predicatetester.service.FragmentationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*") // Allow all origins for dev
public class FragmentationController {

    @Autowired
    private FragmentationService fragmentationService;

    @Autowired
    private DataService dataService;

    @PostMapping("/fragment")
    public FragmentationResponse fragment(@RequestBody FragmentationRequest request) {
        return fragmentationService.processFragmentation(request);
    }

    @GetMapping("/students")
    public List<Student> getStudents() {
        return dataService.getStudents();
    }

    @GetMapping("/reconstruct")
    public List<Student> reconstruct() {
        return fragmentationService.reconstruct();
    }

    @DeleteMapping("/site/{id}")
    public boolean deleteSite(@PathVariable String id) {
        return fragmentationService.deleteSite(id);
    }
}
