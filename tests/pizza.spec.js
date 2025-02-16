import { test, expect } from "playwright-test-coverage";

async function login(page) {
  await page.getByPlaceholder("Email address").click();
  await page.getByPlaceholder("Email address").fill("d@jwt.com");
  await page.getByPlaceholder("Email address").press("Tab");
  await page.getByPlaceholder("Password").fill("a");
  await page.getByRole("button", { name: "Login" }).click();
}

let routes = {};

test("home page", async ({ page }) => {
  await page.goto("/");

  expect(await page.title()).toBe("JWT Pizza");
});
test("diner page", async ({ page }) => {
  await page.route("*/**/api/auth", async (route) => {
    const loginReq = { email: "d@jwt.com", password: "a" };
    const loginRes = {
      user: {
        id: 3,
        name: "Kai Chen",
        email: "d@jwt.com",
        roles: [{ role: "diner" }],
      },
      token: "abcdef",
    };
    expect(route.request().method()).toBe("PUT");
    expect(route.request().postDataJSON()).toMatchObject(loginReq);
    await route.fulfill({ json: loginRes });
  });

  await page.goto("http://localhost:5173/diner-dashboard");
  await page.getByRole("link", { name: "Login", exact: true }).click();

  await login(page);
  await page.getByRole("link", { name: "KC" }).click();
  await expect(page.getByRole("heading")).toContainText("Your pizza kitchen");
  await expect(page.locator(".text-start > .hs-tooltip")).toBeVisible();
  await expect(page.getByRole("main")).toContainText("Kai Chen");
  await expect(page.getByRole("main")).toContainText(
    "How have you lived this long without having a pizza? Buy one now!"
  );
});

test("admin diner page", async ({ page }) => {
  await page.route("*/**/api/auth", async (route) => {
    const loginReq = { email: "d@jwt.com", password: "a" };
    const loginRes = {
      user: {
        id: 3,
        name: "Kai Chen",
        email: "d@jwt.com",
        roles: [
          {
            role: "admin",
          },
          {
            objectId: 16,
            role: "franchisee",
          },
          {
            objectId: 17,
            role: "franchisee",
          },
          {
            objectId: 20,
            role: "franchisee",
          },
        ],
      },
      token: "abcdef",
    };
    expect(route.request().method()).toBe("PUT");
    expect(route.request().postDataJSON()).toMatchObject(loginReq);
    await route.fulfill({ json: loginRes });
  });

  await page.goto("http://localhost:5173/diner-dashboard");
  await page.getByRole("link", { name: "Login", exact: true }).click();

  await login(page);

  await page.getByRole("link", { name: "KC" }).click();
  await expect(page.getByRole("main")).toContainText(
    "admin, Franchisee on 16, Franchisee on 17, Franchisee on 20"
  );
});
test("purchase with login", async ({ page }) => {
  await page.route("*/**/api/order/menu", async (route) => {
    const menuRes = [
      {
        id: 1,
        title: "Veggie",
        image: "pizza1.png",
        price: 0.0038,
        description: "A garden of delight",
      },
      {
        id: 2,
        title: "Pepperoni",
        image: "pizza2.png",
        price: 0.0042,
        description: "Spicy treat",
      },
    ];
    expect(route.request().method()).toBe("GET");
    await route.fulfill({ json: menuRes });
  });

  await page.route("*/**/api/franchise", async (route) => {
    const franchiseRes = [
      {
        id: 2,
        name: "LotaPizza",
        stores: [
          { id: 4, name: "Lehi" },
          { id: 5, name: "Springville" },
          { id: 6, name: "American Fork" },
        ],
      },
      { id: 3, name: "PizzaCorp", stores: [{ id: 7, name: "Spanish Fork" }] },
      { id: 4, name: "topSpot", stores: [] },
    ];
    expect(route.request().method()).toBe("GET");
    await route.fulfill({ json: franchiseRes });
  });

  await page.route("*/**/api/auth", async (route) => {
    const loginReq = { email: "d@jwt.com", password: "a" };
    const loginRes = {
      user: {
        id: 3,
        name: "Kai Chen",
        email: "d@jwt.com",
        roles: [{ role: "diner" }],
      },
      token: "abcdef",
    };
    expect(route.request().method()).toBe("PUT");
    expect(route.request().postDataJSON()).toMatchObject(loginReq);
    await route.fulfill({ json: loginRes });
  });

  await page.route("*/**/api/order", async (route) => {
    const orderReq = {
      items: [
        { menuId: 1, description: "Veggie", price: 0.0038 },
        { menuId: 2, description: "Pepperoni", price: 0.0042 },
      ],
      storeId: "4",
      franchiseId: 2,
    };
    const orderRes = {
      order: {
        items: [
          { menuId: 1, description: "Veggie", price: 0.0038 },
          { menuId: 2, description: "Pepperoni", price: 0.0042 },
        ],
        storeId: "4",
        franchiseId: 2,
        id: 23,
      },
      jwt: "eyJpYXQ",
    };
    expect(route.request().method()).toBe("POST");
    expect(route.request().postDataJSON()).toMatchObject(orderReq);
    await route.fulfill({ json: orderRes });
  });

  await page.goto("/");

  // Go to order page
  await page.getByRole("button", { name: "Order now" }).click();

  // Create order
  await expect(page.locator("h2")).toContainText("Awesome is a click away");
  await page.getByRole("combobox").selectOption("4");
  await page.getByRole("link", { name: "Image Description Veggie A" }).click();
  await page.getByRole("link", { name: "Image Description Pepperoni" }).click();
  await expect(page.locator("form")).toContainText("Selected pizzas: 2");
  await page.getByRole("button", { name: "Checkout" }).click();

  // Login
  await page.getByPlaceholder("Email address").click();
  await page.getByPlaceholder("Email address").fill("d@jwt.com");
  await page.getByPlaceholder("Email address").press("Tab");
  await page.getByPlaceholder("Password").fill("a");
  await page.getByRole("button", { name: "Login" }).click();

  // Pay
  await expect(page.getByRole("main")).toContainText(
    "Send me those 2 pizzas right now!"
  );
  await expect(page.locator("tbody")).toContainText("Veggie");
  await expect(page.locator("tbody")).toContainText("Pepperoni");
  await expect(page.locator("tfoot")).toContainText("0.008 ₿");
  await page.getByRole("button", { name: "Pay now" }).click();

  // Check balance
  await expect(page.getByRole("main")).toContainText("23");
  await expect(page.getByRole("main")).toContainText("0.008 ₿");
  await page.getByRole("button", { name: "Verify" }).click();
  await expect(page.locator("h3")).toContainText("JWT Pizza - invalid");
  await page.getByRole("button", { name: "Close" }).click();
});

test("create then delete franchise", async ({ page }) => {
  let stores = [];
  await page.route("*/**/api/franchise", async (route) => {
    const franchiseRes = [
      {
        id: 2,
        name: "LotaPizza",
        stores: [
          { id: 4, name: "Lehi" },
          { id: 5, name: "Springville" },
          { id: 6, name: "American Fork" },
        ],
      },
      { id: 3, name: "PizzaCorp", stores: [{ id: 7, name: "Spanish Fork" }] },
      { id: 4, name: "topSpot", stores: [] },
    ];
    expect(route.request().method()).toBe("GET");
    await route.fulfill({ json: franchiseRes });
  });

  await page.route("*/**/api/auth", async (route) => {
    const loginReq = { email: "d@jwt.com", password: "a" };
    const loginRes = {
      user: {
        id: 3,
        name: "Kai Chen",
        email: "d@jwt.com",
        roles: [
          { role: "diner" },
          {
            objectId: 1,
            role: "franchisee",
          },
        ],
      },
      token: "abcdef",
    };
    expect(["PUT", "DELETE"]).toContain(route.request().method());
    if (route.request().method() == "PUT") {
      expect(route.request().postDataJSON()).toMatchObject(loginReq);
      await route.fulfill({ json: loginRes });
    } else {
      await route.fulfill({ json: { message: "logout successful" } });
    }
  });

  await page.route("*/**/api/franchise/3", async (route) => {
    const res = [
      {
        id: 1,
        name: "radioactive waste",
        admins: [
          {
            id: 4,
            name: "test",
            email: "t@jwt.com",
          },
        ],
        stores: stores,
      },
    ];
    expect(route.request().method()).toBe("GET");
    await route.fulfill({ json: res });
  });

  await page.route("*/**/api/franchise/1/store", async (route) => {
    const req = { name: "asdfgkasdgfkjahgsdkfahgdsf" };
    const res = { id: 15, franchiseId: 1, name: "hehehe" };
    expect(route.request().method()).toBe("POST");
    expect(route.request().postDataJSON()).toMatchObject(req);

    stores.push({
      id: 15,
      name: "asdfgkasdgfkjahgsdkfahgdsf",
      totalRevenue: 0,
    });

    await route.fulfill({ json: res });
  });

  await page.route("*/**/api/franchise/1/store/15", async (route) => {
    const res = { message: "store deleted" };
    expect(route.request().method()).toBe("DELETE");

    stores = [];
    await route.fulfill({ json: res });
  });

  await page.goto("http://localhost:5173/");
  await page
    .getByLabel("Global")
    .getByRole("link", { name: "Franchise" })
    .click();
  await expect(page.getByText("So you want a piece of the")).toBeVisible();

  await page.getByRole("link", { name: "Login", exact: true }).click();

  await login(page);

  await page
    .getByLabel("Global")
    .getByRole("link", { name: "Franchise" })
    .click();
  await page.getByRole("button", { name: "Create store" }).click();
  await page.getByRole("textbox", { name: "store name" }).click();
  await page
    .getByRole("textbox", { name: "store name" })
    .fill("asdfgkasdgfkjahgsdkfahgdsf");
  await page.getByRole("button", { name: "Create" }).click();
  await expect(
    page.getByRole("cell", { name: "asdfgkasdgfkjahgsdkfahgdsf" })
  ).toBeVisible();
  await page.getByRole("button", { name: "Close" }).click();
  await expect(page.getByText("Are you sure you want to")).toBeVisible();
  await page.getByRole("button", { name: "Close" }).click();
  await page.getByRole("link", { name: "Logout" }).click();
  await page
    .getByLabel("Global")
    .getByRole("link", { name: "Franchise" })
    .click();

  await expect(page.getByText("So you want a piece of the")).toBeVisible();
});

test("rando page", async ({ page }) => {
  await page.goto("http://localhost:5173/rando-apge");
  await expect(page.getByRole("heading")).toContainText("Oops");
  await page.getByText("It looks like we have dropped").click();
  await page.getByText("JWT Pizza", { exact: true }).click();
});

test("docs", async ({ page }) => {
  await page.route("*/**/api/docs", async (route) => {
    const res = {
      version: "20240518.154317",
      endpoints: [
        {
          method: "asdfadsfafd",
          path: "/api/auth/adfadfadf",
          description: "Register a new user3456",
          example:
            'curl -X POST localhost:3000/api/auth -d \'{"name":"pizza diner", "email":"d@jwt.com", "password":"diner"}\' -H \'Content-Type: application/json\'',
          response: {
            user: {
              id: 2,
              name: "pizza diner",
              email: "d@jwt.com",
              roles: [
                {
                  role: "diner",
                },
              ],
            },
            token: "tttttt",
          },
        },
      ],
      config: {
        factory: "https://pizza-factory.cs329.click",
        db: "localhost",
      },
    };

    await route.fulfill({ json: res });
  });
  await page.goto("http://localhost:5173/docs");
  await expect(page.getByRole("main")).toContainText("JWT Pizza API");
  await expect(page.getByRole("main")).toContainText("[asdfadsfafd] /api/auth/adfadfadf");
  await expect(page.getByText("Register a new user3456")).toBeVisible();
});

test("admin page", async ({ page }) => {
  await page.route("*/**/api/auth", async (route) => {
    const loginReq = { email: "d@jwt.com", password: "a" };
    const loginRes = {
      user: {
        id: 3,
        name: "Kai Chen",
        email: "d@jwt.com",
        roles: [
          {
            role: "admin",
          },
          {
            objectId: 16,
            role: "franchisee",
          },
          {
            objectId: 17,
            role: "franchisee",
          },
          {
            objectId: 20,
            role: "franchisee",
          },
        ],
      },
      token: "abcdef",
    };
    expect(["PUT", "DELETE"]).toContain(route.request().method());
    if (route.request().method() == "PUT") {
      expect(route.request().postDataJSON()).toMatchObject(loginReq);
      await route.fulfill({ json: loginRes });
    } else {
      await route.fulfill({ json: { message: "logout successful" } });
    }
  });
  await page.route("*/**/api/franchise", async (route) => {
    const res = 
      [
        {
            "id": 3,
            "name": "BYU",
            "stores": []
        },
        {
            "id": 14,
            "name": "f1",
            "stores": [
                {
                    "id": 8,
                    "name": "f2"
                },
                {
                    "id": 9,
                    "name": "f3"
                },
                {
                    "id": 10,
                    "name": "f4"
                },
                {
                    "id": 11,
                    "name": "f4"
                },
                {
                    "id": 12,
                    "name": "f6"
                }
            ]
        },
        {
            "id": 15,
            "name": "f7",
            "stores": []
        },
        {
            "id": 17,
            "name": "Picken's Pizza",
            "stores": []
        },
        {
            "id": 1,
            "name": "pizzaPocket",
            "stores": [
                {
                    "id": 1,
                    "name": "SLC"
                },
                {
                    "id": 17,
                    "name": "Provo"
                }
            ]
        },
        {
            "id": 4,
            "name": "radioactive waste",
            "stores": []
        },
        {
            "id": 16,
            "name": "Shrek's Pizza",
            "stores": [
                {
                    "id": 18,
                    "name": "provo"
                }
            ]
        },
        {
            "id": 8,
            "name": "test",
            "stores": [
                {
                    "id": 19,
                    "name": "provo"
                }
            ]
        },
        {
            "id": 20,
            "name": "yum pizza",
            "stores": []
        }
    ]

    expect(route.request().method()).toBe("GET");

    await route.fulfill({ json: res });
  });

  await page.goto("http://localhost:5173/");
  await page.getByRole("link", { name: "Login" }).click();
  await login(page);
  

await expect(page.getByRole('heading')).toContainText('The web\'s best pizza');

  await expect(page.getByRole("heading")).toContainText("Mama Ricci's kitchen");
  
  await page
    .getByRole("row", { name: "Provo ₿ Close", exact: true })
    .getByRole("button")
    .click();
  await expect(page.getByRole("heading")).toContainText("Sorry to see you go");
  await page.getByText("Are you sure you want to").click();
  await expect(page.getByRole("main")).toContainText("Close");
  await page.getByRole("button", { name: "Cancel" }).click();
  await page.getByRole("button", { name: "Add Franchise" }).click();
  await page.getByRole("textbox", { name: "franchise name" }).click();
  await page.getByRole("textbox", { name: "franchise name" }).fill("bobby joe");
  await page.getByRole("textbox", { name: "franchisee admin email" }).click();
  await page
    .getByRole("textbox", { name: "franchisee admin email" })
    .fill("f@jwt.com");
  await page.getByRole("button", { name: "Cancel" }).click();
});

test("about page", async ({ page }) => {
  await page.goto("http://localhost:5173/");

  await page.getByRole("link", { name: "About", exact: true }).click();
  await expect(page.getByText("The secret sauce")).toBeVisible();
  await expect(page.getByRole("main")).toContainText("The secret sauce");
  await expect(page.getByRole("main")).toContainText(
    "At JWT Pizza, our amazing employees are the secret behind our delicious pizzas. They are passionate about their craft and spend every waking moment dreaming about how to make our pizzas even better. From selecting the finest ingredients to perfecting the dough and sauce recipes, our employees go above and beyond to ensure the highest quality and taste in every bite. Their dedication and attention to detail make all the difference in creating a truly exceptional pizza experience for our customers. We take pride in our team and their commitment to delivering the best pizza in town."
  );
  await expect(
    page.getByRole("heading", { name: "Our employees" })
  ).toBeVisible();
  await expect(page.getByRole("main")).toContainText("Our employees");
  await expect(page.getByRole("main")).toContainText(
    "At JWT Pizza, our employees are more than just pizza makers. They are culinary artists who are deeply passionate about their craft. They approach each pizza with creativity, precision, and a genuine love for what they do. From experimenting with unique flavor combinations to perfecting the cooking process, our employees are constantly pushing the boundaries of what a pizza can be. Their dedication and expertise result in pizzas that are not only delicious but also a reflection of their passion and commitment. We are grateful for our talented team and the incredible pizzas they create day in and day out."
  );
});

test("history page", async ({ page }) => {
  await page.goto("http://localhost:5173/");

  await page.getByRole("link", { name: "History", exact: true }).click();

  await expect(page.getByText("Mama Rucci, my my")).toBeVisible();
  await expect(page.getByRole("main").getByRole("img")).toBeVisible();
  await expect(page.getByText("It all started in Mama Ricci'")).toBeVisible();
  await expect(page.getByRole("main")).toContainText(
    "Pizza has a long and rich history that dates back thousands of years."
  );
});

test("register", async ({ page }) => {
  await page.goto("http://localhost:5173/");

  await page.getByRole("link", { name: "Register" }).click();

  await expect(page.getByText("Already have an account?")).toBeVisible();
  await page.getByRole("textbox", { name: "Full name" }).click();
  await page.getByRole("textbox", { name: "Full name" }).fill("Jacob");
  await page.getByRole("textbox", { name: "Email address" }).click();
  await page
    .getByRole("textbox", { name: "Email address" })
    .fill("jacob@email.com");
  await page.getByRole("textbox", { name: "Password" }).click();
  await page.getByRole("textbox", { name: "Password" }).fill("password");
  await page.getByRole("button", { name: "Register" }).click();
});
