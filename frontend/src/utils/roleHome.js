// Central place that decides where each role lands after login.
export function roleHome(role) {
  switch (role) {
    case "employee": return "/employee";
    case "hod": return "/hod";
    case "hr": return "/hr";
    case "md": return "/admin";
    default: return "/login";
  }
}
