import 'package:flutter/material.dart';
import 'package:graphql_flutter/graphql_flutter.dart';

final httpLink = HttpLink("http://192.168.0.150:9478/graphql");

ValueNotifier<GraphQLClient> client =
    ValueNotifier(GraphQLClient(cache: GraphQLCache(), link: httpLink));
