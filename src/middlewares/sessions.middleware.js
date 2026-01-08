export function handleSession(req, res, next) {
    if (req.session.user) { 
        return res.status(200).redirect("/profile");
        next();
    } else {
        return res.status(401).redirect("/login");
    }
}

export function avoidLoginView(req, res, next) {
    if(!req.session.user) {
        next();
    } else {
        return res.status(200).redirect("/profile");
    }
}