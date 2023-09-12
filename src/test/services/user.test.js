const User = require("../../models/User");
const userController = require("../../controllers/user.controller");
const dbHelper = require("../db-helper");

describe("user service", () => {
  beforeEach(async () => {
    await dbHelper.connect();
    jest.setTimeout(10000);
  });
  afterEach(async () => {
    await dbHelper.clearDatabase();
  });
  afterAll(async () => {
    await dbHelper.closeDatabase();
  });

  // Test the clearDatabase function
  it("should clear the database collections", async () => {
    // Add some data to a collection (e.g., User) before testing
    await User.create({ name: "John", email: "john@gmail.com", password: "123" });
    // Call the clearDatabase function
    await dbHelper.clearDatabase();
    // Check if the collection is empty after clearing
    const users = await User.find();
    expect(users).toHaveLength(0);
  });

});

// it("should create a new user", async () => {
//   const user = await User.create({ name: "John", email: "john@gmail.com", password: "123" });
//   console.log("Test user:", user);

//   expect(user).resolves.toEqual(user);
// });

// it("should find all user", async () => {
//   const user = await User.create({ name: "John", email: "john@gmail.com", password: "123" });
//   const foundUsers = await UserService.findAll();
//   console.log("Test user:", user);
//   console.log("User list:", foundUsers);

//   expect(foundUsers).resolves.toEqual(user);
// });

// describe("Test Database Helper Functions", () => {
//   // This hook runs once before all the tests in this suite
//   beforeAll(async () => {
//     // Connect to the in-memory database before running tests
//     await dbHelper.connect();
//   });

//   beforeEach(async () => {
//     // Clear the database before each test
//     await dbHelper.clearDatabase();
//   });

//   // This hook runs once after all the tests in this suite
//   afterAll(async () => {
//     // Close the database connection and stop the in-memory server
//     await dbHelper.closeDatabase();
//   });

//   // Test the clearDatabase function
//   it("should clear the database collections", async () => {
//     // Add some data to a collection (e.g., User) before testing
//     await User.create({ name: "John", email: "john@gmail.com", password: "123" });

//     // Call the clearDatabase function
//     await dbHelper.clearDatabase();

//     // Check if the collection is empty after clearing
//     const users = await User.find();
//     expect(users).toHaveLength(0);
//   });
// });

