package cz.projektant_pata.tda26.event.course.module;

import cz.projektant_pata.tda26.model.course.Course;
import cz.projektant_pata.tda26.model.course.module.Module;

import java.util.UUID;

public record ModuleDeactivatedEvent(Course course, Module module) {}