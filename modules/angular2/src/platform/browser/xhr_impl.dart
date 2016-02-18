library angular2.src.services.xhr_impl;

import 'dart:async' show Future;
import 'dart:html' show HttpRequest;
import 'package:angular2/core.dart';
import 'package:angular2/src/compiler/xhr.dart';
import 'package:angular2/src/core/testability/testability.dart';

@Injectable()
class XHRImpl extends XHR {
  Testability testability;

  XHRImpl(this.testability) {}

  Future<String> get(String url) {
  	testability.increasePendingRequestCount();
    return HttpRequest.request(url).then((HttpRequest req) {
	    	testability.decreasePendingRequestCount();
	    	return req.responseText;
    	}, onError: (_) {
	    	testability.decreasePendingRequestCount();
	    	return new Future.error('Failed to load $url');
    	});
  }
}
