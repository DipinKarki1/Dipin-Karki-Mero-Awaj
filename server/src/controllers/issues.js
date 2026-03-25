import Issue from '../models/Issue.js';
import User from '../models/User.js';

// @desc    Create new issue
// @route   POST /api/v1/issues
// @access  Private
export const createIssue = async (req, res, next) => {
  try {
    req.body.author = req.user.id;
    if (req.file) {
      req.body.imageUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    }
    if (req.body.latitude && req.body.longitude) {
      req.body.locationCoords = {
        lat: Number(req.body.latitude),
        lng: Number(req.body.longitude),
      };
    }

    const issue = await Issue.create(req.body);

    // Award points
    const user = await User.findById(req.user.id);
    user.civicPoints += 50;
    user.updateRank();
    await user.save();

    res.status(201).json({
      success: true,
      data: issue,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

// @desc    Get all issues
// @route   GET /api/v1/issues
// @access  Public
export const getIssues = async (req, res, next) => {
  try {
    if (req.user?.role === 'authority') {
      if (!req.user.authorityCategory) {
        return res.status(200).json({
          success: true,
          count: 0,
          data: [],
          message: 'No authority category assigned',
        });
      }
      const issues = await Issue.find({
        category: req.user.authorityCategory,
      }).populate({
        path: 'author',
        select: 'name',
      });

      return res.status(200).json({
        success: true,
        count: issues.length,
        data: issues,
      });
    }

    const issues = await Issue.find().populate({
      path: 'author',
      select: 'name',
    });

    res.status(200).json({
      success: true,
      count: issues.length,
      data: issues,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

// @desc    Get single issue
// @route   GET /api/v1/issues/:id
// @access  Public
export const getIssue = async (req, res, next) => {
  try {
    const issue = await Issue.findById(req.params.id).populate({
      path: 'author',
      select: 'name',
    });

    if (!issue) {
      return res.status(404).json({
        success: false,
        message: 'Issue not found',
      });
    }

    res.status(200).json({
      success: true,
      data: issue,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

// @desc    Get feedback for homepage
// @route   GET /api/v1/issues/feedbacks
// @access  Public
export const getIssueFeedbacks = async (req, res, next) => {
  try {
    const issues = await Issue.find({
      feedback: { $exists: true, $ne: null },
    })
      .populate({ path: 'author', select: 'name' })
      .select('title feedback author')
      .sort({ 'feedback.createdAt': -1 })
      .limit(6);

    const feedbacks = issues
      .filter((issue) => issue.feedback)
      .map((issue) => ({
        issueId: issue._id,
        title: issue.title,
        rating: issue.feedback?.rating || 0,
        comment: issue.feedback?.comment || '',
        author: issue.author?.name || 'Anonymous',
        createdAt: issue.feedback?.createdAt || issue.createdAt,
      }));

    res.status(200).json({
      success: true,
      count: feedbacks.length,
      data: feedbacks,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

// @desc    Get user notifications
// @route   GET /api/v1/issues/notifications
// @access  Private (User)
export const getUserNotifications = async (req, res, next) => {
  try {
    const issues = await Issue.find({ author: req.user.id })
      .select('title status progressUpdates createdAt')
      .sort({ createdAt: -1 });

    const notifications = [];

    issues.forEach((issue) => {
      if (issue.progressUpdates && issue.progressUpdates.length > 0) {
        issue.progressUpdates.forEach((update, idx) => {
          notifications.push({
            issueId: issue._id,
            title: issue.title,
            status: update.status || issue.status,
            message: update.message || `Status updated to ${update.status || issue.status}`,
            updatedAt: update.updatedAt || issue.createdAt,
            sequence: idx,
            type: 'progress',
          });
        });
      } else {
        notifications.push({
          issueId: issue._id,
          title: issue.title,
          status: issue.status,
          message: `Issue reported. Current status: ${issue.status}`,
          updatedAt: issue.createdAt,
          sequence: 0,
          type: 'status',
        });
      }
    });

    notifications.sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );

    res.status(200).json({
      success: true,
      count: notifications.length,
      data: notifications,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

// @desc    Vote an issue
// @route   PUT /api/v1/issues/:id/vote
// @access  Private
export const voteIssue = async (req, res, next) => {
  try {
    const issue = await Issue.findById(req.params.id);

    if (!issue) {
      return res.status(404).json({
        success: false,
        message: 'Issue not found',
      });
    }

    if (issue.author?.toString() === req.user.id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot vote on your own issue',
      });
    }

    const alreadyVoted = issue.votes.some(
      (v) => v.toString() === req.user.id.toString()
    );

    if (alreadyVoted) {
      return res.status(400).json({
        success: false,
        message: 'You have already voted on this issue',
      });
    }

    const updatedIssue = await Issue.findByIdAndUpdate(
      req.params.id,
      { $addToSet: { votes: req.user.id } },
      { new: true }
    );

    // Award points for voting
    const user = await User.findById(req.user.id);
    user.civicPoints += 10;
    user.updateRank();
    await user.save();

    res.status(200).json({
      success: true,
      data: updatedIssue,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

// @desc    Get issues for chat (Citizen sees only their own, Authority sees all)
// @route   GET /api/v1/issues/chat
// @access  Private
export const getChatIssues = async (req, res, next) => {
  try {
    let query;

    if (req.user.role === 'user') {
      query = Issue.find({ author: req.user.id });
    } else {
      query = Issue.find();
    }

    const issues = await query.sort('-createdAt');

    res.status(200).json({
      success: true,
      count: issues.length,
      data: issues,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

// @desc    Update issue status and add progress update
// @route   PUT /api/v1/issues/:id/status
// @access  Private (Authority/Admin)
export const updateIssueStatus = async (req, res, next) => {
  try {
    const { status, message } = req.body;

    const issue = await Issue.findById(req.params.id);

    if (!issue) {
      return res.status(404).json({
        success: false,
        message: 'Issue not found',
      });
    }

    // Use atomic update to avoid failing on legacy invalid documents
    const updatedIssue = await Issue.findByIdAndUpdate(
      req.params.id,
      {
        $set: { status },
        $push: {
          progressUpdates: {
            status,
            message,
            updatedBy: req.user.id,
          },
        },
      },
      { new: true, runValidators: false }
    );

    res.status(200).json({
      success: true,
      data: updatedIssue,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

// @desc    Add feedback to a resolved issue
// @route   PUT /api/v1/issues/:id/feedback
// @access  Private (Author only)
export const addFeedback = async (req, res, next) => {
  try {
    const { rating, comment } = req.body;

    let issue = await Issue.findById(req.params.id);

    if (!issue) {
      return res.status(404).json({
        success: false,
        message: 'Issue not found',
      });
    }

    // Check if user is the author
    if (issue.author.toString() !== req.user.id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Only the author of the issue can provide feedback',
      });
    }

    // Check if issue is resolved
    if (issue.status !== 'Resolved') {
      return res.status(400).json({
        success: false,
        message: 'Feedback can only be provided for resolved issues',
      });
    }

    issue.feedback = {
      rating,
      comment,
      createdAt: Date.now(),
    };

    await issue.save();

    // Award points for feedback
    const user = await User.findById(req.user.id);
    user.civicPoints += 30;
    user.updateRank();
    await user.save();

    res.status(200).json({
      success: true,
      data: issue,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};
