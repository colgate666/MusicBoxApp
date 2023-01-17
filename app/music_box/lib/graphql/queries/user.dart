import 'package:graphql_flutter/graphql_flutter.dart';

final getUserByUsernameOrEmailQuery = gql("""
  query GetUserByUsernameOrEmail(\$user: String!) {
    getUserByUsernameOrEmail(user: \$user) {
      id
    }
  }
""");

final addUserMutation = gql("""
  mutation AddUser(\$input: RegisterInput!) {
    addUser(input: \$input) {
      id
    }
  }
""");

class RegisterInput {
  String username;
  String email;
  String password;
  String? avatar;

  RegisterInput(
      {required this.username,
      required this.email,
      required this.password,
      this.avatar});

  Map<String, dynamic> toJson() {
    final data = Map<String, dynamic>();
    data['username'] = username;
    data['email'] = email;
    data['password'] = password;
    data['avatar'] = avatar;
    return data;
  }
}
