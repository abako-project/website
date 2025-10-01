

// GET + /dashboard
exports.home = async (req, res, next) => {
  res.redirect("/dashboard/projects");
}

// GET + /dashboard/projects
exports.projects = async (req, res, next) => {



  if (req.session.loginUser?.isAdmin) {
    res.redirect("/projects");
  } else if (req.session.loginUser.clientId) {
    res.redirect("/clients/" + req.session.loginUser.clientId + "/projects");
  } else if (req.session.loginUser.developerId) {
    res.redirect("/developers/" + req.session.loginUser.developerId + "/projects");
  }
}

// GET + /dashboard/milestones
exports.milestones = async (req, res, next) => {
  if (req.session.loginUser?.isAdmin) {
    res.redirect("/milestones");
  } else if (req.session.loginUser.clientId) {
    res.redirect("/clients/" + req.session.loginUser.clientId + "/milestones");
  } else if (req.session.loginUser.developerId) {
    res.redirect("/developers/" + req.session.loginUser.developerId + "/milestones");
  }
}
