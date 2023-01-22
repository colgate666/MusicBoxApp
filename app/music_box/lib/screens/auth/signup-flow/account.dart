import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:graphql_flutter/graphql_flutter.dart';
import 'package:image_picker/image_picker.dart';
import 'package:music_box/graphql/queries/user.dart';

class SignUpAccountDataScreen extends StatefulWidget {
  const SignUpAccountDataScreen({super.key, required this.email});

  final String email;

  @override
  State<SignUpAccountDataScreen> createState() =>
      _SignUpAccountDataScreenState();
}

class _SignUpAccountDataScreenState extends State<SignUpAccountDataScreen> {
  String _usernameInput = "";
  String _passwordInput = "";
  String? _userImage;
  bool _loading = false;
  bool _done = false;

  onRegister() async {
    String? message;

    if (!(_usernameInput.characters.length > 3 &&
        _usernameInput.characters.length < 30)) {
      message = "Username must be between 3 and 30 characters";
    } else if (!(_passwordInput.characters.length > 3 &&
        _passwordInput.characters.length < 30)) {
      message = "Password must be between 3 and 30 characters";
    }

    if (message != null) {
      final snack = SnackBar(content: Text(message));
      ScaffoldMessenger.of(context).showSnackBar(snack);
      return;
    }

    _loading = true;

    GraphQLClient client = GraphQLProvider.of(context).value;
    final result = await client
        .mutate(MutationOptions(document: addUserMutation, variables: {
      "input": RegisterInput(
          username: _usernameInput,
          email: widget.email,
          password: _passwordInput,
          avatar: _userImage)
    }));

    if (result.hasException) {
      final errMsg = result.exception?.graphqlErrors[0].message;

      if (errMsg != null) {
        final snack = SnackBar(content: Text(errMsg));
        ScaffoldMessenger.of(context).showSnackBar(snack);
      }
    } else {
      _done = true;
      const snack = SnackBar(content: Text("Account created."));
      ScaffoldMessenger.of(context).showSnackBar(snack);
    }

    _loading = false;
  }

  onAvatarPressed() async {
    final picker = ImagePicker();
    final image = await picker.pickImage(source: ImageSource.gallery);

    if (image != null) {
      final bytes = await image.readAsBytes();
      final b64Str = base64Encode(bytes);
      setState(() {
        _userImage = b64Str;
      });
    } else {
      setState(() {
        _userImage = null;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text("Sign Up")),
      body: Column(
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          const SizedBox(
            height: 8,
          ),
          GestureDetector(
            onTap: onAvatarPressed,
            child: CircleAvatar(
              backgroundImage: _userImage == null
                  ? const AssetImage("assets/Portrait_Placeholder.png")
                  : MemoryImage(base64Decode(_userImage!)) as ImageProvider,
              radius: 80,
            ),
          ),
          const SizedBox(
            height: 12,
          ),
          Padding(
            padding: const EdgeInsets.only(left: 8, right: 8),
            child: TextField(
              enabled: !_loading && !_done,
              decoration: const InputDecoration(
                  border: OutlineInputBorder(), label: Text("Username")),
              textInputAction: TextInputAction.next,
              onSubmitted: (value) => _usernameInput = value,
            ),
          ),
          const SizedBox(
            height: 12,
          ),
          Padding(
            padding: const EdgeInsets.only(left: 8, right: 8),
            child: TextField(
              enabled: !_loading && !_done,
              decoration: const InputDecoration(
                  border: OutlineInputBorder(), label: Text("Password")),
              keyboardType: TextInputType.visiblePassword,
              textInputAction: TextInputAction.done,
              obscureText: true,
              onSubmitted: (value) => _passwordInput = value,
            ),
          ),
          const SizedBox(
            height: 12,
          ),
          ElevatedButton(
              onPressed: !_loading && !_done ? onRegister : null,
              child: const Text("Register"))
        ],
      ),
    );
  }
}
