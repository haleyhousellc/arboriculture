# How to contribute

I'm happy that you're considering contributing to the project.  There is always plenty to do:

* Filing/fixing bugs
* Development of new data structures
* Defining more comprehensive testing suites
* Improving documentation
* Streamlining developer workflow
* Updating examples

I'd like to formally invite you to participate in our [Slack channel](https://haleyhousellc.slack.com/messages/C6AT049P0/details/).

## Coding conventions

Read through the codebase to get a better feel for our style.  Our primary style objective is to produce clear, readable
code to facilitate maintenance and new-member adoption.  See the full tslint list
[here](https://github.com/haleyhousellc/arboriculture/blob/master/tslint.json).  In our view, long lines and verbose
variable naming beats concise code any day.

Comment, comment, comment!

## Documentation

We take documentation seriously.  In addition to clear, readable code, comprehensive documentation is a must - this
includes ample comments within code, and pertinent markdown files placed in the
[`docs`](https://github.com/haleyhousellc/arboriculture/blob/master/docs/) directory.

## Testing

We have a complete, but fairly limited, suite of tests included in the [`src`](https://github.com/haleyhousellc/arboriculture/blob/master/src/)
directory.  New trees (and most new code, in general) should include basic testing to demonstrate correctness.  We ask
that you follow the naming convention for testing files.  E.g. if testing a file named `foo.ts`, your test file should
reside in the same directory with the name `foo.spec.ts`.

If adding a system-wide integration test, place the file (again, with the extension `.spec.ts`) in the root-level
directory `test`.

## Examples

After documentation and testing, examples provide additional clarity on how to use your code.  The
[`examples`](https://github.com/haleyhousellc/arboriculture/blob/master/examples/)
directory hosts files with the extension `.demo.ts` to distinguish their purpose from standard source files.  These
files are linted, so please use good coding style.

This is your chance to show users how easy your feature is to use!

## Submitting changes

Please send a [GitHub Pull Request to arboriculture](https://github.com/haleyhousellc/arboriculture/pull/new/master)
with a clear list of what you've done (read more about [pull requests](https://help.github.com/articles/about-pull-requests/)).

Always write a clear log message for your commits. Including references to any issues that may be fixed or augmented can
also be helpful.  One-line messages are fine for small changes, but bigger changes should look like this:

```bash
$ git commit -m "A brief summary of the commit
>
> A paragraph describing what changed and its impact."
```

## Regards
On behalf of our community, I'd like to thank you for any contributions to the project!

Sincerely, [Graham Haley](https://github.com/haleyga)
