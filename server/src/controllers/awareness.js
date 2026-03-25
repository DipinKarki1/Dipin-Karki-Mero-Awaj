import Awareness from '../models/Awareness.js';

// @desc    Get all awareness articles
// @route   GET /api/v1/awareness
// @access  Public
export const getAwarenessArticles = async (req, res, next) => {
  try {
    const articles = await Awareness.find().populate({
      path: 'author',
      select: 'name role',
    }).sort('-createdAt');

    res.status(200).json({
      success: true,
      count: articles.length,
      data: articles,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

// @desc    Create awareness article
// @route   POST /api/v1/awareness
// @access  Private (Authority/Admin)
export const createAwarenessArticle = async (req, res, next) => {
  try {
    req.body.author = req.user.id;
    if (req.file) {
      req.body.image = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    }

    const article = await Awareness.create(req.body);

    res.status(201).json({
      success: true,
      data: article,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

// @desc    Update awareness article
// @route   PUT /api/v1/awareness/:id
// @access  Private (Authority/Admin)
export const updateAwarenessArticle = async (req, res, next) => {
  try {
    const article = await Awareness.findById(req.params.id);
    if (!article) {
      return res.status(404).json({
        success: false,
        message: 'Article not found',
      });
    }

    // Route already restricts to authority/admin

    const { title, content, category } = req.body;
    if (title) article.title = title;
    if (content) article.content = content;
    if (category) article.category = category;
    if (req.file) {
      article.image = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    }

    await article.save();

    res.status(200).json({
      success: true,
      data: article,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

// @desc    Delete awareness article
// @route   DELETE /api/v1/awareness/:id
// @access  Private (Authority/Admin)
export const deleteAwarenessArticle = async (req, res, next) => {
  try {
    const article = await Awareness.findById(req.params.id);
    if (!article) {
      return res.status(404).json({
        success: false,
        message: 'Article not found',
      });
    }

    // Route already restricts to authority/admin

    await article.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Article deleted',
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};
