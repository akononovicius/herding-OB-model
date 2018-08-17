# Herding behavior model for the order book dynamics

Here you can find an implementation of the order book model, which is discussed
in the forthcoming paper (the reference link will be added at a later time).

This implementation also provides CLI interface, which enables access to PDF and
PSD of the absolute return and trading activity time series. The respective time
series can be also saved and analyzed using other tools.

## FAQ

Why TypeScript? Implementing the original model in C/C++ would be quite possible,
but it would make harder to extend the model in the future (when OOP would be
actually relevant). We have also considered implementing model in Python, where
using Numpy potentially could make array operations faster. But it seems that
array operations are not the bottleneck in this case, thus Python code is
noticeably slower.
