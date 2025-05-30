import { Navigate } from "react-router-dom";

export const RequireAuth = ({ children }) => {
  const token = localStorage.getItem("token");
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

export const RequireGuest = ({ children }) => {
  const token = localStorage.getItem("token");
  if (token) {
    return <Navigate to="/" replace />;
  }
  return children;
};

export const RequireRole = ({ children, allowedRoles }) => {
  const token = localStorage.getItem("token");
  const userRole = localStorage.getItem("userRole");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(userRole)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

export const withAuth = (WrappedComponent) => {
  return (props) => {
    return (
      <RequireAuth>
        <WrappedComponent {...props} />
      </RequireAuth>
    );
  };
};

export const withGuest = (WrappedComponent) => {
  return (props) => {
    return (
      <RequireGuest>
        <WrappedComponent {...props} />
      </RequireGuest>
    );
  };
};

export const withRole = (WrappedComponent, allowedRoles) => {
  return (props) => {
    return (
      <RequireRole allowedRoles={allowedRoles}>
        <WrappedComponent {...props} />
      </RequireRole>
    );
  };
};
