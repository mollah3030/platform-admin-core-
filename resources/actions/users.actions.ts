import { usersApi } from "@/resources/apis/users.api";
import type {
  User,
  PaginatedUsersResponse,
  UserQueryParams,
  CreateUserRequest,
  UpdateUserRequest,
  AssignUserRoleRequest,
  MessageResponse,
} from "@/resources/interfaces";

export async function fetchUsersAction(
  params?: UserQueryParams,
): Promise<PaginatedUsersResponse> {
  return usersApi.getUsers(params);
}

export async function fetchUserByIdAction(id: string): Promise<User> {
  return usersApi.getUserById(id);
}

export async function createUserAction(
  payload: CreateUserRequest,
): Promise<User> {
  return usersApi.createUser(payload);
}

export async function updateUserAction(
  id: string,
  payload: UpdateUserRequest,
): Promise<User> {
  return usersApi.updateUser(id, payload);
}

export async function deleteUserAction(id: string): Promise<void> {
  return usersApi.deleteUser(id);
}

export async function activateUserAction(id: string): Promise<MessageResponse> {
  return usersApi.activateUser(id);
}

export async function deactivateUserAction(id: string): Promise<MessageResponse> {
  return usersApi.deactivateUser(id);
}

export async function assignUserRoleAction(
  userId: string,
  payload: AssignUserRoleRequest,
): Promise<{ id: string; userId: string; roleId: string; assignedAt: string }> {
  return usersApi.assignRole(userId, payload);
}

export async function removeUserRoleAction(
  userId: string,
  roleId: string,
): Promise<void> {
  return usersApi.removeRole(userId, roleId);
}
