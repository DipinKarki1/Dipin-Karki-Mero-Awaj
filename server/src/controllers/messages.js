import Message from '../models/Message.js';
import Issue from '../models/Issue.js';

// @desc    Get messages for an issue
// @route   GET /api/v1/messages/:issueId
// @access  Private
export const getMessages = async (req, res, next) => {
  try {
    const issue = await Issue.findById(req.params.issueId);

    if (!issue) {
      return res.status(404).json({ success: false, message: 'Issue not found' });
    }

    // Authorization: Only author or authority/admin
    if (
      issue.author.toString() !== req.user.id.toString() &&
      req.user.role === 'user'
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view these messages',
      });
    }

    const messages = await Message.find({ issue: req.params.issueId })
      .populate({
        path: 'sender',
        select: 'name role',
      })
      .sort('createdAt');

    res.status(200).json({
      success: true,
      count: messages.length,
      data: messages,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

// @desc    Create a message
// @route   POST /api/v1/messages
// @access  Private
export const createMessage = async (req, res, next) => {
  try {
    const { issue: issueId, text } = req.body;
    
    const issue = await Issue.findById(issueId);

    if (!issue) {
      return res.status(404).json({ success: false, message: 'Issue not found' });
    }

    // Authorization: Only author or authority/admin
    if (
      issue.author.toString() !== req.user.id.toString() &&
      req.user.role === 'user'
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to send messages here',
      });
    }

    const message = await Message.create({
      issue: issueId,
      text,
      sender: req.user.id,
    });

    const populatedMessage = await Message.findById(message._id).populate({
      path: 'sender',
      select: 'name role',
    });

    res.status(201).json({
      success: true,
      data: populatedMessage,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};
