const Folder = require('../models/Folder');

// @desc    Get all folders for a user
// @route   GET /api/folders
// @access  Private (should be protected with auth middleware)
const getFolders = async (req, res) => {
  try {
    const { userId, parentFolder } = req.query;
    
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    const query = { userId, isArchived: false };
    
    if (parentFolder !== undefined) {
      query.parentFolder = parentFolder === 'null' || parentFolder === '' ? null : parentFolder;
    }

    const folders = await Folder.find(query)
      .populate('parentFolder', 'name')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: folders.length,
      data: folders
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
};

// @desc    Get a single folder by ID
// @route   GET /api/folders/:id
// @access  Private
const getFolderById = async (req, res) => {
  try {
    const folder = await Folder.findById(req.params.id)
      .populate('parentFolder', 'name');

    if (!folder) {
      return res.status(404).json({ 
        success: false,
        error: 'Folder not found' 
      });
    }

    res.status(200).json({
      success: true,
      data: folder
    });
  } catch (error) {
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ 
        success: false,
        error: 'Folder not found' 
      });
    }
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
};

// @desc    Create a new folder
// @route   POST /api/folders
// @access  Private
const createFolder = async (req, res) => {
  try {
    const { name, description, parentFolder, userId, color } = req.body;

    if (!name || !userId) {
      return res.status(400).json({ 
        success: false,
        error: 'Name and userId are required' 
      });
    }

    // Check if folder with same name exists for this user at same level
    const existingFolder = await Folder.findOne({
      name,
      userId,
      parentFolder: parentFolder || null,
      isArchived: false
    });

    if (existingFolder) {
      return res.status(400).json({ 
        success: false,
        error: 'A folder with this name already exists at this level' 
      });
    }

    // If parentFolder is provided, verify it exists
    if (parentFolder) {
      const parent = await Folder.findById(parentFolder);
      if (!parent) {
        return res.status(404).json({ 
          success: false,
          error: 'Parent folder not found' 
        });
      }
      if (parent.userId !== userId) {
        return res.status(403).json({ 
          success: false,
          error: 'Cannot create folder under another user\'s folder' 
        });
      }
    }

    const folder = await Folder.create({
      name,
      description,
      parentFolder: parentFolder || null,
      userId,
      color
    });

    res.status(201).json({
      success: true,
      data: folder
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ 
        success: false,
        error: messages 
      });
    }
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
};

// @desc    Update a folder
// @route   PUT /api/folders/:id
// @access  Private
const updateFolder = async (req, res) => {
  try {
    const { name, description, parentFolder, color, isArchived } = req.body;

    let folder = await Folder.findById(req.params.id);

    if (!folder) {
      return res.status(404).json({ 
        success: false,
        error: 'Folder not found' 
      });
    }

    // Prevent moving a folder into itself or its descendants
    if (parentFolder && parentFolder === req.params.id) {
      return res.status(400).json({ 
        success: false,
        error: 'Cannot move a folder into itself' 
      });
    }

    // Check for duplicate name if name is being changed
    if (name && name !== folder.name) {
      const existingFolder = await Folder.findOne({
        name,
        userId: folder.userId,
        parentFolder: parentFolder !== undefined ? (parentFolder || null) : folder.parentFolder,
        isArchived: false,
        _id: { $ne: req.params.id }
      });

      if (existingFolder) {
        return res.status(400).json({ 
          success: false,
          error: 'A folder with this name already exists at this level' 
        });
      }
    }

    // Update fields
    if (name !== undefined) folder.name = name;
    if (description !== undefined) folder.description = description;
    if (parentFolder !== undefined) folder.parentFolder = parentFolder || null;
    if (color !== undefined) folder.color = color;
    if (isArchived !== undefined) folder.isArchived = isArchived;

    await folder.save();

    res.status(200).json({
      success: true,
      data: folder
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ 
        success: false,
        error: messages 
      });
    }
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ 
        success: false,
        error: 'Folder not found' 
      });
    }
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
};

// @desc    Delete a folder
// @route   DELETE /api/folders/:id
// @access  Private
const deleteFolder = async (req, res) => {
  try {
    const folder = await Folder.findById(req.params.id);

    if (!folder) {
      return res.status(404).json({ 
        success: false,
        error: 'Folder not found' 
      });
    }

    // Check if folder has sub-folders
    const subFolders = await Folder.find({ parentFolder: req.params.id });
    
    if (subFolders.length > 0) {
      return res.status(400).json({ 
        success: false,
        error: 'Cannot delete folder with sub-folders. Delete or move sub-folders first.' 
      });
    }

    await folder.deleteOne();

    res.status(200).json({
      success: true,
      data: {},
      message: 'Folder deleted successfully'
    });
  } catch (error) {
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ 
        success: false,
        error: 'Folder not found' 
      });
    }
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
};

module.exports = {
  getFolders,
  getFolderById,
  createFolder,
  updateFolder,
  deleteFolder
};
