#---------------------------------------------------------------------------------
# Shardscape for GameCube. Builds shardscape.dol
# Needs devkitPPC and libogc2 (devkitPro), and QuickJS in third_party/quickjs
# (run sh get-deps.sh once). The GitHub build does all of this for you.
#---------------------------------------------------------------------------------
.SUFFIXES:

ifeq ($(strip $(DEVKITPPC)),)
$(error "DEVKITPPC is not set. Use the GitHub build or the Docker command in README.md")
endif

# libogc2: the Broadband Adapter and WIZnet-based adapters (ETH2GC), SD2SP2
include $(DEVKITPRO)/libogc2/gamecube_rules

ifneq (build,$(notdir $(CURDIR)))
ifneq ($(MAKECMDGOALS),clean)
ifeq ($(wildcard third_party/quickjs/quickjs.c),)
$(error "QuickJS not found in third_party/quickjs. Run sh get-deps.sh first (see README.md)")
endif
endif
endif

TARGET		:=	shardscape
BUILD		:=	build
SOURCES		:=	source source/net third_party/quickjs
DATA		:=	js
INCLUDES	:=	source

CFLAGS	= -g -O2 -Wall -Wno-unused -ffunction-sections -fdata-sections $(MACHDEP) $(INCLUDE)
CXXFLAGS	=	$(CFLAGS)
LDFLAGS	=	-g $(MACHDEP) -Wl,--gc-sections -Wl,-Map,$(notdir $@).map

# libfat reads the SD card, libbba is the network adapter; both before libogc
LIBS	:=	-lfat -lbba -logc -lm
LIBDIRS	:=	$(PORTLIBS)

ifneq ($(BUILD),$(notdir $(CURDIR)))
#---------------------------------------------------------------------------------
export OUTPUT	:=	$(CURDIR)/$(TARGET)
export VPATH	:=	$(foreach dir,$(SOURCES),$(CURDIR)/$(dir)) $(foreach dir,$(DATA),$(CURDIR)/$(dir))
export DEPSDIR	:=	$(CURDIR)/$(BUILD)

CFILES		:=	$(foreach dir,$(SOURCES),$(notdir $(wildcard $(dir)/*.c)))
BINFILES	:=	$(foreach dir,$(DATA),$(notdir $(wildcard $(dir)/*.js)))
export LD	:=	$(CC)
export OFILES_BIN	:=	$(addsuffix .o,$(BINFILES))
export OFILES_SOURCES	:=	$(CFILES:.c=.o)
export OFILES	:=	$(OFILES_BIN) $(OFILES_SOURCES)
export HFILES	:=	$(addsuffix .h,$(subst .,_,$(BINFILES)))

export INCLUDE	:=	$(foreach dir,$(INCLUDES), -I$(CURDIR)/$(dir)) \
			-I$(CURDIR)/source/net -I$(CURDIR)/third_party/quickjs \
			$(foreach dir,$(LIBDIRS),-I$(dir)/include) \
			-I$(CURDIR)/$(BUILD) -I$(LIBOGC_INC)
export LIBPATHS	:=	-L$(LIBOGC_LIB) $(foreach dir,$(LIBDIRS),-L$(dir)/lib)

.PHONY: $(BUILD) clean
$(BUILD):
	@[ -d $@ ] || mkdir -p $@
	@$(MAKE) --no-print-directory -C $(BUILD) -f $(CURDIR)/Makefile

clean:
	@echo clean ...
	@rm -fr $(BUILD) $(OUTPUT).elf $(OUTPUT).dol

#---------------------------------------------------------------------------------
else

DEPENDS	:=	$(OFILES:.o=.d)

$(OUTPUT).dol: $(OUTPUT).elf
$(OUTPUT).elf: $(OFILES)
$(OFILES_SOURCES) : $(HFILES)

# the game's scripts are built into the program
%.js.o	%_js.h :	%.js
	@echo $(notdir $<)
	@$(bin2o)

# QuickJS: the settings it's built with (and a few warnings of its own style turned off)
quickjs.o libregexp.o libunicode.o cutils.o dtoa.o: CFLAGS += -D_GNU_SOURCE -DCONFIG_VERSION='"2026-06-04"' \
	-Wno-sign-compare -Wno-unused-variable -Wno-unused-but-set-variable -Wno-array-bounds

-include $(DEPENDS)

endif
