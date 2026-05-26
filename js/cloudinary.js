export const CLOUDINARY_FOLDER = 'superxmart';
const CLOUDINARY_CLOUD_NAME = 'dgbiw89se';
const CLOUDINARY_UPLOAD_PRESET = 'superxmart_uploads';

export const uploadToCloudinary = async (file) => {
    const url = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
    formData.append('folder', CLOUDINARY_FOLDER);

    try {
        const response = await fetch(url, {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            const errData = await response.json();
            throw new Error(errData.error?.message || 'Failed to upload image to Cloudinary');
        }

        const data = await response.json();

        // Return the full Cloudinary metadata for Firestore storage
        return {
            secure_url: data.secure_url,
            public_id: data.public_id,
            asset_id: data.asset_id,
            format: data.format,
            width: data.width,
            height: data.height,
            bytes: data.bytes,
            resource_type: data.resource_type,
            created_at: data.created_at,
            folder: data.folder || CLOUDINARY_FOLDER
        };
    } catch (error) {
        console.error("Cloudinary upload error:", error);
        throw error;
    }
};
