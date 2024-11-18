const Drf = require('../models/Drf.js');
const cloudinary = require('cloudinary').v2;

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Controller to get all DRFs
const getDrf = async (req, res) => {
    console.log("Hello")
    try {
        const drfs = await Drf.find();
        res.status(200).json({ success: true, data: drfs });
    } catch (error) {
        console.error('Error fetching DRFs:', error.message);
        res.status(500).json({ success: false, error: 'Failed to fetch DRFs' });
    }
};

// Controller to get a single DRF by ID
const getDrfById = async (req, res) => {
    const { id } = req.params;

    try {
        const drf = await Drf.findById(id);

        if (!drf) {
            return res.status(404).json({ success: false, error: 'DRF not found' });
        }

        res.status(200).json({ success: true, data: drf });
    } catch (error) {
        console.error(`Error fetching DRF with ID ${id}:`, error.message);
        res.status(500).json({ success: false, error: 'Failed to fetch DRF' });
    }
};

// Controller to create a new DRF
const createDrf = async (req, res) => {
    const {
        client,
        project,
        deliverable,
        content,
        design,
        authorizedBy,
        projectManager,
        completedOn,
        creator
    } = req.body;

    try {
        const newDrf = await Drf.create({
            client,
            project,
            deliverable,
            content,
            design,
            authorizedBy,
            projectManager,
            completedOn,
            creator
        });

        res.status(201).json({ success: true, data: newDrf });
    } catch (error) {
        console.error('Error creating DRF:', error.message);
        res.status(500).json({ success: false, error: 'Failed to create DRF' });
    }
};

// Controller to delete a DRF by ID
const deleteDrf = async (req, res) => {
    const { id } = req.params;

    try {
        // Find the DRF by ID
        const drfToDelete = await Drf.findById(id);

        if (!drfToDelete) {
            return res.status(404).json({ success: false, error: 'DRF not found' });
        }

        // Delete all images in `drfs` array from Cloudinary
        const deletePromises = drfToDelete.drfs.map((slide) => {
            if (slide.imgRef) {
                const publicId = slide.imgRef.split('/').pop().split('.')[0]; // Extract public ID
                return cloudinary.uploader.destroy(`drfImages/${publicId}`);
            }
            return Promise.resolve(); // If no `imgRef`, resolve immediately
        });

        await Promise.all(deletePromises); // Wait for all deletions to complete

        // Delete the DRF document from the database
        const deletedDrf = await Drf.findByIdAndDelete(id);

        res.status(200).json({ success: true, message: 'DRF and associated images deleted successfully' });
    } catch (error) {
        console.error(`Error deleting DRF with ID ${id}:`, error.message);
        res.status(500).json({ success: false, error: 'Failed to delete DRF' });
    }
};

// Controller to add a new object to the `drfs` array
const addDrfsObject = async (req, res) => {
    const { id } = req.params;
    const { sectionTitle, slideTitle, transcript, notes, imgRef } = req.body;

    try {
        // Find the DRF by ID
        const drf = await Drf.findById(id);

        if (!drf) {
            return res.status(404).json({ success: false, error: 'DRF not found' });
        }

        let uploadedImageUrl = null;

        // Check if `imgRef` is provided and upload if exists
        if (imgRef) {
            const uploadedImage = await cloudinary.uploader.upload(imgRef, {
                folder: 'drfImages', // Cloudinary folder name
            });
            uploadedImageUrl = uploadedImage.secure_url;
        }

        // Create a new slide object
        const newSlide = {
            sectionTitle,
            slideTitle,
            transcript,
            notes,
            imgRef: uploadedImageUrl || null, // Use uploaded URL or set to null if `imgRef` not provided
        };

        // Push the new slide to the `drfs` array
        drf.drfs.push(newSlide);

        // Save the updated DRF document
        await drf.save();

        res.status(200).json({ success: true, data: drf });
    } catch (error) {
        console.error('Error adding object to drfs:', error);
        res.status(500).json({ success: false, error: 'Failed to add object to drfs' });
    }
};


// Controller to delete an object from the `drfs` array by object ID
const deleteDrfsObject = async (req, res) => {
    const { id, objectId } = req.params;

    try {
        const drf = await Drf.findById(id);

        if (!drf) {
            return res.status(404).json({ success: false, error: 'DRF not found' });
        }

        drf.drfs = drf.drfs.filter((item) => item._id.toString() !== objectId); // Remove object
        await drf.save();

        res.status(200).json({ success: true, data: drf });
    } catch (error) {
        console.error('Error deleting object from drfs:', error.message);
        res.status(500).json({ success: false, error: 'Failed to delete object from drfs' });
    }
};

const updateDrf = async (req, res) => {
    try {
        const {
            client,
            project,
            deliverable,
            content,
            design,
            authorizedBy,
            projectManager,
            completedOn,
            creator
        } = req.body;

        const { id } = req.params;

        // Find the DRF by ID
        const drf = await Drf.findById(id);

        if (!drf) {
            return res.status(404).json({ success: false, error: 'DRF not found' });
        }

        // Update the DRF fields
        drf.creator = creator || drf.creator;
        drf.client = client || drf.client;
        drf.project = project || drf.project;
        drf.deliverable = deliverable || drf.deliverable;
        drf.content = content || drf.content;
        drf.design = design || drf.design;
        drf.authorizedBy = authorizedBy || drf.authorizedBy;
        drf.projectManager = projectManager || drf.projectManager;
        drf.completedOn = completedOn || drf.completedOn;

        // Save the updated DRF document
        const updatedDrf = await drf.save();

        res.status(200).json({ success: true, data: updatedDrf });
    } catch (error) {
        console.error('Error updating DRF:', error.message);
        res.status(500).json({ success: false, error: 'Failed to update DRF' });
    }
};


const updateDrfsSlide = async (req, res) => {
    const { drfId, slideId } = req.params; // Extract `drfId` and `slideId` from params
    const { imgRef, ...updateData } = req.body; // `imgRef` contains the new image's Base64 string

    try {
        // Find the DRF by ID
        const drf = await Drf.findById(drfId);

        if (!drf) {
            return res.status(404).json({ success: false, error: 'DRF not found' });
        }

        // Find the slide within `drfs` array
        let slideFound = false;
        drf.drfs = await Promise.all(
            drf.drfs.map(async (slide) => {
                if (slide._id.toString() === slideId) {
                    slideFound = true;

                    let newImgRef = slide.imgRef;

                    // Handle image update only if `imgRef` is provided
                    if (imgRef) {
                        // Delete the previous image from Cloudinary
                        if (slide.imgRef) {
                            const publicId = slide.imgRef.split('/').pop().split('.')[0]; // Extract public ID from URL
                            await cloudinary.uploader.destroy(`drfImages/${publicId}`);
                        }

                        // Upload the new image to Cloudinary
                        const uploadedImage = await cloudinary.uploader.upload(imgRef, {
                            folder: 'drfImages',
                        });
                        newImgRef = uploadedImage.secure_url; // Update `imgRef` with new Cloudinary URL
                    }

                    // Return the updated slide object
                    return { ...slide.toObject(), ...updateData, imgRef: newImgRef };
                }
                return slide;
            })
        );

        if (!slideFound) {
            return res.status(404).json({ success: false, error: 'Slide not found in DRF' });
        }

        // Save the updated DRF
        const updatedDrf = await drf.save();

        res.status(200).json({ success: true, data: updatedDrf });
    } catch (error) {
        console.error('Error updating slide in DRF:', error.message);
        res.status(500).json({ success: false, error: 'Failed to update slide in DRF' });
    }
};




const deleteDrfsSlide = async (req, res) => {
    const { drfId, slideId } = req.params; // Extract `drfId` and `slideId` from params

    try {
        // Find the DRF by ID
        const drf = await Drf.findById(drfId);

        if (!drf) {
            return res.status(404).json({ success: false, error: 'DRF not found' });
        }

        // Find the slide to delete
        const slideToDelete = drf.drfs.find((slide) => slide._id.toString() === slideId);

        if (!slideToDelete) {
            return res.status(404).json({ success: false, error: 'Slide not found in DRF' });
        }

        // Delete the image from Cloudinary if `imgRef` exists
        if (slideToDelete.imgRef) {
            const publicId = slideToDelete.imgRef.split('/').pop().split('.')[0]; // Extract public ID from URL
            await cloudinary.uploader.destroy(`drfImages/${publicId}`);
        }

        // Filter out the slide to delete from the `drfs` array
        drf.drfs = drf.drfs.filter((slide) => slide._id.toString() !== slideId);

        // Save the updated DRF
        const updatedDrf = await drf.save();

        res.status(200).json({ success: true, message: 'Slide deleted successfully', data: updatedDrf });
    } catch (error) {
        console.error('Error deleting slide from DRF:', error.message);
        res.status(500).json({ success: false, error: 'Failed to delete slide from DRF' });
    }
};

const searchDrf = async (req, res) => {
    console.log("hellow")
    const { q } = req.query; // Extract the `q` parameter from the query string
    console.log(q)
    if (!q) {
        return res.status(400).json({ success: false, error: 'Query parameter is required' });
    }

    try {
        // Search for DRFs where the client field matches the query (case-insensitive)
        const results = await Drf.find({ client: { $regex: q, $options: 'i' } });

        if (results.length === 0) {
            return res.status(404).json({ success: false, message: 'No DRFs found matching the query' });
        }

        // Return matching DRFs
        res.status(200).json({ success: true, data: results });
    } catch (error) {
        console.error('Error searching DRFs:', error.message);
        res.status(500).json({ success: false, error: 'Failed to search DRFs' });
    }
};

module.exports = {
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
};
