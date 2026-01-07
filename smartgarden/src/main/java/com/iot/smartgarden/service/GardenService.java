package com.iot.smartgarden.service;

import com.iot.smartgarden.entity.Garden;
import com.iot.smartgarden.repository.GardenRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class GardenService {

    private final GardenRepository gardenRepository;

    public GardenService(GardenRepository gardenRepository) {
        this.gardenRepository = gardenRepository;
    }

    public Garden createGarden(Garden garden) {
        return gardenRepository.save(garden);
    }

    public List<Garden> getGardensByUser(Long userId) {
        return gardenRepository.findByUserId(userId);
    }

    public List<Garden> getAllGardens() {
        return gardenRepository.findAll();
    }
}
