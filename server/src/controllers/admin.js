import User from "../models/User.js";
import Issue from "../models/Issue.js";

// @desc    Admin overview stats
// @route   GET /api/v1/admin/overview
// @access  Private (Admin)
export const getOverview = async (req, res) => {
  try {
    const [
      totalUsers,
      totalAuthorities,
      totalAdmins,
      totalIssues,
      openIssues,
      inProgressIssues,
      resolvedIssues,
    ] = await Promise.all([
      User.countDocuments({ role: "user" }),
      User.countDocuments({ role: "authority" }),
      User.countDocuments({ role: "admin" }),
      Issue.countDocuments(),
      Issue.countDocuments({ status: "Open" }),
      Issue.countDocuments({ status: "In Progress" }),
      Issue.countDocuments({ status: "Resolved" }),
    ]);

    const topIssues = await Issue.aggregate([
      { $addFields: { voteCount: { $size: "$votes" } } },
      { $sort: { voteCount: -1 } },
      { $limit: 5 },
      {
        $project: {
          title: 1,
          category: 1,
          status: 1,
          voteCount: 1,
          createdAt: 1,
        },
      },
    ]);

    const recentIssues = await Issue.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select("title category status createdAt");

    res.status(200).json({
      success: true,
      data: {
        counts: {
          totalUsers,
          totalAuthorities,
          totalAdmins,
          totalIssues,
          openIssues,
          inProgressIssues,
          resolvedIssues,
        },
        topIssues,
        recentIssues,
      },
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

// @desc    List users
// @route   GET /api/v1/admin/users
// @access  Private (Admin)
export const getUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      data: users,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

// @desc    Update user role/category
// @route   PUT /api/v1/admin/users/:id
// @access  Private (Admin)
export const updateUser = async (req, res) => {
  try {
    const { name, email } = req.body;

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (email && email !== user.email) {
      const existing = await User.findOne({ email, _id: { $ne: user._id } });
      if (existing) {
        return res.status(400).json({
          success: false,
          message: "Email is already in use",
        });
      }
      user.email = email;
    }

    if (name) {
      user.name = name;
    }

    await user.save();

    res.status(200).json({
      success: true,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        authorityCategory: user.authorityCategory || null,
        civicPoints: user.civicPoints,
        rank: user.rank,
      },
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

// @desc    Delete user
// @route   DELETE /api/v1/admin/users/:id
// @access  Private (Admin)
export const deleteUser = async (req, res) => {
  try {
    if (req.user.id === req.params.id) {
      return res.status(400).json({
        success: false,
        message: "You cannot delete your own account",
      });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    await user.deleteOne();

    res.status(200).json({
      success: true,
      message: "User deleted",
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};
