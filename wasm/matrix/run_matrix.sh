#!/bin/zsh
# Build matrix for a wasm-pack crate: profile settings via cargo env overrides,
# so no manifest is edited. Usage: run_matrix.sh <crate-dir> <out-dir> <out-name>
# Example: run_matrix.sh ~/Projects/epubveri/epubveri-wasm /tmp/matrix epubveri
set -u
CRATE=${1:?crate dir}; OUT=${2:?out dir}; NAME=${3:?wasm-pack --out-name}
mkdir -p $OUT
RESULTS=$OUT/sizes.tsv
: > $RESULTS

build() {
  local name=$1; shift
  echo "=== [$name] $(date +%H:%M:%S) env: $* ==="
  local t0=$(date +%s)
  ( cd $CRATE && env "$@" wasm-pack build . --target web --out-name $NAME \
      --out-dir "$OUT/$name" ) > "$OUT/$name.log" 2>&1
  local rc=$? t1=$(date +%s)
  if [[ $rc -ne 0 ]]; then
    echo "$name\tBUILD_FAILED" >> $RESULTS
    echo "[$name] FAILED (see $name.log)"; return
  fi
  local wasm=$(ls "$OUT/$name"/*.wasm 2>/dev/null | head -1)
  local size=$(stat -f %z "$wasm")
  local gz=$(gzip -9 -c "$wasm" | wc -c | tr -d ' ')
  echo "$name\t$size\t$gz\t$((t1-t0))s" >> $RESULTS
  echo "[$name] wasm=$size gz=$gz build=$((t1-t0))s"
}

build A_baseline
build B_ltothin      CARGO_PROFILE_RELEASE_LTO=thin
build C_ltofat_cu1   CARGO_PROFILE_RELEASE_LTO=true CARGO_PROFILE_RELEASE_CODEGEN_UNITS=1
build D_C_optz       CARGO_PROFILE_RELEASE_LTO=true CARGO_PROFILE_RELEASE_CODEGEN_UNITS=1 CARGO_PROFILE_RELEASE_OPT_LEVEL=z
build E_C_opt3       CARGO_PROFILE_RELEASE_LTO=true CARGO_PROFILE_RELEASE_CODEGEN_UNITS=1 CARGO_PROFILE_RELEASE_OPT_LEVEL=3
build F_D_abort      CARGO_PROFILE_RELEASE_LTO=true CARGO_PROFILE_RELEASE_CODEGEN_UNITS=1 CARGO_PROFILE_RELEASE_OPT_LEVEL=z CARGO_PROFILE_RELEASE_PANIC=abort
build G_C_opts       CARGO_PROFILE_RELEASE_LTO=true CARGO_PROFILE_RELEASE_CODEGEN_UNITS=1 CARGO_PROFILE_RELEASE_OPT_LEVEL=s

echo "DONE $(date +%H:%M:%S)"
cat $RESULTS
