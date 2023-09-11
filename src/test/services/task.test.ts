import Task from "../../models/Task";
import TaskController from "../../controllers/project.controller";
import * as dbHelper from "../db-helper";

const nonExistingTaskId = "5ee1337ba4538021340e7d97";

async function createTask() {
  const task = new Task({
    name: "Create Test folder for project",
    description: "Test folder for project",
    status: ["Pending"],
    priority: ["Low"],
  });
  return await TaskController.createTask(task);
}

describe("task service", () => {
  beforeEach(async () => {
    await dbHelper.connect();
  });

  afterEach(async () => {
    await dbHelper.clearDatabase();
  });

  afterAll(async () => {
    await dbHelper.closeDatabase();
  });

  it("should create a task", async () => {
    const task = await createTask();
    expect(task).toHaveProperty("id");
    expect(task).toHaveProperty("name", "Create Test folder for project");
    expect(task).toHaveProperty("description", "Test folder for project");
    expect(task).toHaveProperty(
      "status",
      expect.objectContaining({
        status: expect.arrayContaining(["Pending"]),
      })
    );
    expect(task).toHaveProperty(
      "priority",
      expect.objectContaining({
        priority: expect.arrayContaining(["Low"]),
      })
    );
  });
});

