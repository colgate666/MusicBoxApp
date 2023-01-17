import 'package:email_validator/email_validator.dart';
import 'package:flutter/material.dart';
import 'package:graphql_flutter/graphql_flutter.dart';
import 'package:music_box/graphql/queries/user.dart';
import 'package:music_box/screens/auth/signup-flow/account.dart';

class SignUpEmailScreen extends StatefulWidget {
  const SignUpEmailScreen({super.key});

  @override
  State<SignUpEmailScreen> createState() => _SignUpEmailScreenState();
}

class _SignUpEmailScreenState extends State<SignUpEmailScreen> {
  bool _loading = false;

  Future<void> onSubmit(String email) async {
    _loading = true;
    final messenger = ScaffoldMessenger.of(context);
    final navigator = Navigator.of(context);

    if (!EmailValidator.validate(email)) {
      messenger.showSnackBar(const SnackBar(content: Text("Email not valid.")));
      _loading = false;
      return;
    }

    GraphQLClient client = GraphQLProvider.of(context).value;
    final result = await client.query(QueryOptions(
        document: getUserByUsernameOrEmailQuery, variables: {"user": email}));

    if (result.hasException) {
      final notFound =
          result.exception?.graphqlErrors[0].message == "User not found";

      if (notFound && navigator.mounted) {
        navigator.push(MaterialPageRoute(
            builder: (context) => SignUpAccountDataScreen(
                  email: email,
                )));
      }
    } else {
      const snack = SnackBar(content: Text("Email already registered"));
      messenger.showSnackBar(snack);
    }

    _loading = false;
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text("Sign up"),
      ),
      body: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          Padding(
            padding: const EdgeInsets.only(left: 8, right: 8),
            child: TextField(
              enabled: !_loading,
              readOnly: _loading,
              decoration: const InputDecoration(
                border: OutlineInputBorder(),
                label: Text("Email"),
              ),
              keyboardType: TextInputType.emailAddress,
              textInputAction: TextInputAction.done,
              onSubmitted: (value) {
                onSubmit(value);
              },
            ),
          )
        ],
      ),
    );
  }
}
