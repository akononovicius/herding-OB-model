# Herding behavior model for the order book dynamics

Here you can find an implementation of the order book model, which is discussed
in the paper "Order book model with herding behavior exhibiting long-range memory"
[1].

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

## References

[1] A. Kononovicius, J. Ruseckas. *Order book model with herding behavior
exhibiting long-range memory*. Physica A **525**: 171-191 (2019). doi:
[10.1016/j.physa.2019.03.059](https://dx.doi.org/10.1016/j.physa.2019.03.059).
arXiv: [1809.02772 [q-fin.ST]](https://arxiv.org/abs/1809.02772).
