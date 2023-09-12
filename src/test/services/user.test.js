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
