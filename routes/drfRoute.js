const express = require('express');
const {
    getDrf,
    getDrfById,
    createDrf,
    deleteDrf,
    addDrfsObject,
    deleteDrfsObject,
    updateDrf,
    updateDrfsSlide,
    deleteDrfsSlide,
    searchDrf
} = require('../controllers/drfController.js');

const router = express.Router();

// Routes for DRF
router.get('/drf', getDrf); // Get all DRFs
router.get('/drf/search', searchDrf); // Get DRF by ID
router.get('/drf/:id', getDrfById); // Get DRF by ID
router.post('/drf', createDrf); // Create new DRF
router.delete('/drf/:id', deleteDrf); // Delete DRF by ID
router.put('/drf/:id', updateDrf); // Update DRF by ID
router.put('/drf/:drfId/:slideId', updateDrfsSlide); // Update DRF by ID
router.delete('/drf/:drfId/:slideId', deleteDrfsSlide); // Update DRF by ID

// Routes for managing `drfs` array
router.post('/drf/:id/drfs', addDrfsObject); // Add object to `drfs` array
router.delete('/drf/:id/drfs/:objectId', deleteDrfsObject); // Delete object from `drfs` array

module.exports = router;
