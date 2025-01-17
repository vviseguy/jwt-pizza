| User activity                                       | Frontend component | Backend endpoints | Database SQL |
| --------------------------------------------------- | ------------------ | ----------------- | ------------ |
| View home page                                      | home.jsx           | *none*            | *none*       |
| Register new user<br/>(t@jwt.com, pw: test)         | register.jsx       | [POST] /api/auth  | INSERT INTO user (name, email, password) VALUES (?, ?, ?) INSERT INTO userRole (userId, role, objectId) VALUES (?, ?, ?) |
| Login new user<br/>(t@jwt.com, pw: test)            | login.tsx          | [POST] /api/auth  |              |
| Order pizza                                         | menu.tsx           |                   |              |
| Verify pizza                                        | menu.tsx           |                   |              |
| View profile page                                   | dinerDashboard.tsx |                   |              |
| View franchise<br/>(as diner)                       | logout.tsx         | *none*            |              |
| Logout                                              | logout.tsx         |                   |              |
| View About page                                     | about.tsx          | *none*            |              |
| View History page                                   | history.tsx        | *none*            |              |
| Login as franchisee<br/>(f@jwt.com, pw: franchisee) | login.tsx          |                   |              |
| View franchise<br/>(as franchisee)                  | franchiseDashboard |                   |              |
| Create a store                                      | createStore‎.tsx    |                   |              |
| Close a store                                       | closeStore.tsx     |                   |              |
| Login as admin<br/>(a@jwt.com, pw: admin)           | login.tsx          | [POST] /api/auth  |              |
| View Admin page                                     | adminDashboard.tsx |                   |              |
| Create a franchise for t@jwt.com                    | createFranchise.tsx|                   |              |
| Close the franchise for t@jwt.com                   | closeFranchise.tsx |                   |              |
